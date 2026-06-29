import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      // No user yet - let JwtAuthGuard handle authentication
      // This guard only enriches context when user is present
      return true;
    }

    request.tenantContext = {
      tenantId: user.id,
      userId: user.id,
      username: user.username || '',
      roles: user.roles || [],
      permissions: user.permissions || [],
      membershipTier: user.vipLevel ? `vip${user.vipLevel}` : 'normal',
    };
    return true;
  }
}
