-- 初始化会员等级角色
INSERT INTO roles (name, display_name, description, level, is_system, status) VALUES
('normal', '普通用户', '基础用户，拥有最基本的使用权限', 0, 1, 'active'),
('premium', '高级用户', '付费高级用户，享受更多功能和额度', 1, 1, 'active'),
('normal_admin', '普通管理员', '普通管理员，可管理用户和内容', 2, 1, 'active'),
('super_admin', '超级管理员', '超级管理员，拥有系统全部管理权限', 3, 1, 'active'),
('ultimate_admin', '至尊管理员', '至尊管理员，拥有最高级别管理权限', 4, 1, 'active'),
('founder', '罗总专属', '罗圣纪元最高权限，拥有系统全部功能', 5, 1, 'active')
ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), description=VALUES(description), level=VALUES(level);

-- 为 founder 角色分配所有权限（使用通配符）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p
WHERE r.name = 'founder'
ON DUPLICATE KEY UPDATE role_id=role_id;
