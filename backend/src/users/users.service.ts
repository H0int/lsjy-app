import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async updateUserStatus(userId: number, status: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    user.status = status;
    await this.userRepo.save(user);
  }
}
