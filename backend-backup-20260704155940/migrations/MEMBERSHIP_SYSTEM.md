# 会员等级系统

## 6级会员体系

| 等级 | 名称 | 权限级别 |
|------|------|----------|
| 0 | 普通用户 | 基础权限 |
| 1 | 高级用户 | 高级权限 |
| 2 | 管理员 | 管理权限 |
| 3 | 超级管理员 | 超级管理权限 |
| 4 | 至尊管理员 | 至尊管理权限 |
| 5 | 罗总专属 | 最高权限，拥有所有功能 |

## 数据库变更

1. 运行 `add-membership-tier.sql` - 添加 membership_tier 字段
2. 运行 `init-membership-roles.sql` - 初始化会员角色
3. 运行 `ensure-founder-account.sql` - 确保 KF02V9 账号为 founder

## 后端实现

- `User` entity 新增 `membershipTier` 字段
- `AuthService` 自动将 KF02V9 升级为 founder
- JWT token 包含 membershipTier 信息
- founder 拥有通配符权限 `['*']`

## 部署步骤

1. 备份数据库
2. 按顺序执行 SQL migration
3. 重启后端服务
4. 验证 KF02V9 登录
