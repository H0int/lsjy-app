-- 初始化会员等级角色
INSERT INTO roles (name, display_name, description, level, is_system, status) VALUES
('normal_user', '普通用户', '基础权限', 1, 1, 'active'),
('premium_user', '高级用户', '高级权限', 2, 1, 'active'),
('admin', '管理员', '管理权限', 3, 1, 'active'),
('super_admin', '超级管理员', '超级管理权限', 4, 1, 'active'),
('ultimate_admin', '至尊管理员', '至尊管理权限', 5, 1, 'active'),
('founder', '罗总专属', '最高权限，拥有所有功能', 999, 1, 'active')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), description=VALUES(description), level=VALUES(level);

-- 为 founder 角色分配所有权限（使用通配符）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p
WHERE r.name = 'founder'
ON DUPLICATE KEY UPDATE role_id=role_id;
