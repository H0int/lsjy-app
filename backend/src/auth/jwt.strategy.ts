import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, isTokenBlacklisted } from './auth.service';

export interface JwtPayload {
  sub: number;
  username: string;
  roles: string[];
  permissions: string[];
  vipLevel: number;
  type: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || configService.get<string>('app.jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET 环境变量未配置，服务无法启动。请在 .env 中设置 JWT_SECRET。');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check token blacklist (logout)
    if (payload.jti && isTokenBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Token已失效，请重新登录');
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }

    return {
      id: payload.sub,
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions,
      vipLevel: payload.vipLevel,
    };
  }
}
