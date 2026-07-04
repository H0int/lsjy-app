-- 确保 KF02V9 账号存在，如果不存在则创建
INSERT INTO users (username, password_hash, nickname, email, phone, status, membership_tier, created_at, updated_at)
SELECT 'KF02V9', '$2b$10$YourHashedPasswordHere', '罗总', 'founder@lsjyapp.cn', NULL, 'active', 'founder', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'KF02V9');

-- 如果已存在，更新为 founder
UPDATE users SET membership_tier = 'founder', status = 'active' WHERE username = 'KF02V9';

-- 为 KF02V9 分配 founder 角色
INSERT INTO user_roles (user_id, role_id, scope_type, granted_by, granted_at)
SELECT u.id, r.id, 'global', NULL, NOW()
FROM users u, roles r
WHERE u.username = 'KF02V9' AND r.name = 'founder'
ON DUPLICATE KEY UPDATE role_id=role_id;
