import { DataSource } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import * as bcrypt from 'bcrypt';

export async function seedRoles(dataSource: DataSource) {
  const roleRepo = dataSource.getRepository(Role);
  const permissionRepo = dataSource.getRepository(Permission);
  const userRepo = dataSource.getRepository(User);
  const userRoleRepo = dataSource.getRepository(UserRole);

  console.log('🌱 Seeding 6-level role hierarchy...');

  const roles = [
    {
      name: 'normal',
      displayName: '普通用户',
      description: '基础用户，拥有基本使用权限',
      level: 0,
      isSystem: 1,
    },
    {
      name: 'premium',
      displayName: '高级用户',
      description: '付费高级用户，享受更多功能和额度',
      level: 1,
      isSystem: 1,
    },
    {
      name: 'admin',
      displayName: '普通管理员',
      description: '普通管理员，可管理用户和内容',
      level: 2,
      isSystem: 1,
    },
    {
      name: 'super_admin',
      displayName: '超级管理员',
      description: '超级管理员，拥有系统全部管理权限',
      level: 3,
      isSystem: 1,
    },
    {
      name: 'ultimate_admin',
      displayName: '至尊管理员',
      description: '至尊管理员，拥有最高级别管理权限',
      level: 4,
      isSystem: 1,
    },
    {
      name: 'boss',
      displayName: '罗总专属',
      description: '罗圣纪元最高权限，拥有系统全部功能和调试权限',
      level: 5,
      isSystem: 1,
    },
  ];

  for (const roleData of roles) {
    let role = await roleRepo.findOne({ where: { name: roleData.name } });
    if (!role) {
      role = roleRepo.create(roleData);
      await roleRepo.save(role);
      console.log(`  ✅ Created role: ${roleData.displayName} (level ${roleData.level})`);
    } else {
      console.log(`  ⏭️  Role exists: ${roleData.displayName}`);
    }
  }

  // Create permissions
  console.log('🌱 Seeding permissions...');
  const permissions = [
    { name: 'user:read', module: 'user', description: '查看用户信息', sortOrder: 1 },
    { name: 'user:write', module: 'user', description: '修改用户信息', sortOrder: 2 },
    { name: 'user:delete', module: 'user', description: '删除用户', sortOrder: 3 },
    { name: 'content:read', module: 'content', description: '查看内容', sortOrder: 10 },
    { name: 'content:write', module: 'content', description: '发布内容', sortOrder: 11 },
    { name: 'content:moderate', module: 'content', description: '审核内容', sortOrder: 12 },
    { name: 'content:delete', module: 'content', description: '删除内容', sortOrder: 13 },
    { name: 'system:read', module: 'system', description: '查看系统配置', sortOrder: 20 },
    { name: 'system:write', module: 'system', description: '修改系统配置', sortOrder: 21 },
    { name: 'system:debug', module: 'system', description: '系统调试', sortOrder: 22 },
    { name: 'role:manage', module: 'role', description: '管理角色权限', sortOrder: 30 },
    { name: 'finance:read', module: 'finance', description: '查看财务数据', sortOrder: 40 },
    { name: 'finance:manage', module: 'finance', description: '管理财务', sortOrder: 41 },
    { name: 'debug:all', module: 'debug', description: '全部调试权限（罗总专属）', sortOrder: 99 },
  ];

  for (const permData of permissions) {
    let perm = await permissionRepo.findOne({ where: { name: permData.name } });
    if (!perm) {
      perm = permissionRepo.create(permData);
      await permissionRepo.save(perm);
      console.log(`  ✅ Created permission: ${permData.name}`);
    }
  }

  // Assign all permissions to boss role
  console.log('🌱 Assigning permissions to roles...');
  const bossRole = await roleRepo.findOne({ where: { name: 'boss' }, relations: ['permissions'] });
  if (bossRole) {
    const allPerms = await permissionRepo.find();
    bossRole.permissions = allPerms;
    await roleRepo.save(bossRole);
    console.log('  ✅ Boss role (罗总专属): ALL permissions granted');
  }

  // Ensure KF02V9 account has boss role
  console.log('🌱 Setting up boss account KF02V9...');
  let bossUser = await userRepo.findOne({ where: { username: 'KF02V9' } });
  
  if (!bossUser) {
    console.log('  ⚠️  KF02V9 user not found, creating...');
    const passwordHash = await bcrypt.hash('LKZ2005430', 10);
    const newUser = userRepo.create({
      username: 'KF02V9',
      passwordHash,
      nickname: '罗总',
      status: 'active',
      vipLevel: 6,
    });
    bossUser = await userRepo.save(newUser);
    console.log('  ✅ Created KF02V9 user');
  }

  const bossRoleEntity = await roleRepo.findOne({ where: { name: 'boss' } });
  if (bossRoleEntity && bossUser) {
    const existingUserRole = await userRoleRepo.findOne({
      where: { userId: bossUser.id, roleId: bossRoleEntity.id },
    });
    if (!existingUserRole) {
      const userRole = userRoleRepo.create({
        userId: bossUser.id,
        roleId: bossRoleEntity.id,
        scopeType: 'global',
      });
      await userRoleRepo.save(userRole);
      console.log('  ✅ Assigned 罗总专属 role to KF02V9');
    } else {
      console.log('  ⏭️  KF02V9 already has 罗总专属 role');
    }
  }

  console.log('✅ 6-level role system seeding completed!');
}
