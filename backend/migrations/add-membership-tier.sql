-- 添加 membership_tier 字段
ALTER TABLE users 
ADD COLUMN membership_tier ENUM('normal', 'premium', 'admin', 'super_admin', 'ultimate_admin', 'founder') 
DEFAULT 'normal' AFTER vip_level;

-- 创建索引
CREATE INDEX idx_users_membership_tier ON users(membership_tier);

-- 将 KF02V9 设置为 founder
UPDATE users SET membership_tier = 'founder' WHERE username = 'KF02V9';
