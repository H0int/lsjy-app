import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../database/entities/role.entity';
import { Permission } from '../database/entities/permission.entity';
import { UserRole } from '../database/entities/user-role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find({ relations: ['permissions'], order: { level: 'DESC' } });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('角色不存在');
    return role;
  }

  async createRole(data: Partial<Role>): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('角色标识已存在');
    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, data);
    return this.roleRepo.save(role);
  }

  async assignRole(userId: number, roleId: number, scopeType = 'global', scopeId?: number): Promise<UserRole> {
    const userRole = this.userRoleRepo.create({ userId, roleId, scopeType, scopeId });
    return this.userRoleRepo.save(userRole);
  }

  async removeUserRole(userId: number, roleId: number): Promise<void> {
    await this.userRoleRepo.delete({ userId, roleId });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { module: 'ASC', sortOrder: 'ASC' } });
  }
}
