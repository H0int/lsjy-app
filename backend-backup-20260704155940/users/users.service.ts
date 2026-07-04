import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { UserRole } from '../database/entities/user-role.entity';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async findById(id: number): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    const { passwordHash, ...result } = user;
    return result;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    Object.assign(user, dto);
    await this.userRepo.save(user);

    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll(page = 1, pageSize = 20, status?: string): Promise<{ items: Partial<User>[]; total: number; page: number; pageSize: number }> {
    const qb = this.userRepo.createQueryBuilder('user')
      .select(['user.id', 'user.username', 'user.nickname', 'user.avatar', 'user.phone', 'user.email', 'user.status', 'user.userType', 'user.vipLevel', 'user.createdAt', 'user.lastLoginAt']);

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize };
  }

  async getUserRoles(userId: number): Promise<any[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: ['role'],
    });
    return userRoles.map((ur) => ({
      roleId: ur.roleId,
      roleName: ur.role.name,
      displayName: ur.role.displayName,
      scopeType: ur.scopeType,
      scopeId: ur.scopeId,
      expireAt: ur.expireAt,
    }));
  }

  async createUser(data: any, operatorId: number): Promise<Partial<User>> {
    const existing = await this.userRepo.findOne({
      where: [{ username: data.username }, ...(data.email ? [{ email: data.email }] : []), ...(data.phone ? [{ phone: data.phone }] : [])],
    });
    if (existing) {
      if (existing.username === data.username) throw new ConflictException('用户名已存在');
      if (data.email && existing.email === data.email) throw new ConflictException('邮箱已被注册');
      if (data.phone && existing.phone === data.phone) throw new ConflictException('手机号已被注册');
    }
    const passwordHash = await bcrypt.hash(data.password || 'Admin123456', 10);
    const user = this.userRepo.create({
      username: data.username,
      passwordHash,
      nickname: data.nickname || data.username,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status || 'active',
      userType: data.userType || 'personal',
      vipLevel: data.vipLevel || 0,
    });
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async updateUser(id: number, data: any): Promise<Partial<User>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    if (data.nickname !== undefined) user.nickname = data.nickname;
    if (data.email !== undefined) user.email = data.email;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    if (data.userType !== undefined) user.userType = data.userType;
    if (data.vipLevel !== undefined) user.vipLevel = data.vipLevel;
    if (data.status !== undefined) user.status = data.status;
    if (data.password) user.passwordHash = await bcrypt.hash(data.password, 10);
    const saved = await this.userRepo.save(user);
    const { passwordHash, ...result } = saved;
    return result;
  }

  async updateUserStatus(userId: number, status: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = status;
    await this.userRepo.save(user);
  }
}
