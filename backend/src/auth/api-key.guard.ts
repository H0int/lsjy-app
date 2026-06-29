import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../database/entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check for X-API-Key header
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      // Not an API key request, let other guards handle it
      return true;
    }

    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find the key in database
    const record = await this.apiKeyRepo.findOne({
      where: {
        keyHash,
        active: true,
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check expiration
    if (record.expiresAt && new Date() > record.expiresAt) {
      throw new UnauthorizedException('API key expired');
    }

    // Check IP whitelist
    if (record.ipWhitelist && record.ipWhitelist.length > 0) {
      const clientIp = request.ip || request.headers['x-forwarded-for'];
      if (!record.ipWhitelist.includes(clientIp)) {
        throw new UnauthorizedException('IP not whitelisted for this API key');
      }
    }

    // Update last used
    await this.apiKeyRepo.update(record.id, { lastUsedAt: new Date() });

    // Set user context from API key
    request.user = {
      id: record.userId,
      sub: record.userId,
      username: `apikey:${record.keyPrefix}`,
      roles: [],
      permissions: record.permissions || [],
      vipLevel: 0,
      isApiKey: true,
      apiKeyId: record.id,
    };

    this.logger.log(`API key used: ${record.keyPrefix}*** by user ${record.userId}`);
    return true;
  }
}
