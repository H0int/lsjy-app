import { Controller, Post, Delete, Get, Body, Param, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../database/entities/api-key.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('api-keys')
@Controller('api-keys')
@ApiBearerAuth()
export class ApiKeyController {
  private readonly logger = new Logger(ApiKeyController.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  async createApiKey(
    @CurrentUser() user: any,
    @Body() body: { name: string; permissions?: string[]; expiresInDays?: number; ipWhitelist?: string[] },
  ) {
    if (!body.name) throw new BadRequestException('name is required');

    // Generate a random API key
    const rawKey = `lsjy_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 12);

    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = this.apiKeyRepo.create({
      userId: user.id,
      keyHash,
      keyPrefix,
      name: body.name,
      permissions: body.permissions || [],
      ipWhitelist: body.ipWhitelist || [],
      expiresAt,
      active: true,
    });

    await this.apiKeyRepo.save(apiKey);

    this.logger.log(`API key created: ${keyPrefix}*** for user ${user.id}`);

    // Return the raw key only once
    return {
      data: {
        id: apiKey.id,
        key: rawKey, // Only shown once!
        keyPrefix,
        name: apiKey.name,
        permissions: apiKey.permissions,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'List user API keys' })
  async listApiKeys(@CurrentUser() user: any) {
    const keys = await this.apiKeyRepo.find({
      where: { userId: user.id },
      select: ['id', 'keyPrefix', 'name', 'permissions', 'active', 'lastUsedAt', 'expiresAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
    return { data: keys };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  async revokeApiKey(@Param('id') id: number, @CurrentUser() user: any) {
    await this.apiKeyRepo.update({ id: Number(id), userId: user.id }, { active: false });
    this.logger.log(`API key revoked: id=${id} for user ${user.id}`);
    return { data: { success: true } };
  }
}
