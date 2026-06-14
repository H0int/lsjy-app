import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// 角色层级（数字越大权限越高）
const ROLE_HIERARCHY: Record<string, number> = {
  boss: 5,
  ultimate_admin: 4,
  super_admin: 3,
  admin: 2,
  premium: 1,
  operator: 1,
  merchant: 0,
  normal: 0,
  user: 0,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      return false;
    }

    // 层级感知：用户最高等级 >= 所需最低等级即可通过
    const userMaxLevel = Math.max(...user.roles.map((r: string) => ROLE_HIERARCHY[r] ?? 0));
    const requiredMinLevel = Math.min(...requiredRoles.map((r) => ROLE_HIERARCHY[r] ?? 0));
    return userMaxLevel >= requiredMinLevel;
  }
}
