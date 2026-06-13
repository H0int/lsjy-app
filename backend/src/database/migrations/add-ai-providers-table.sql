-- ============================================================
-- 罗圣纪元SaaS平台 - AI Provider配置表
-- 迁移脚本：新增 ai_providers 表
-- ============================================================

CREATE TABLE IF NOT EXISTS `ai_providers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT 'Provider标识',
  `display_name` VARCHAR(100) NOT NULL COMMENT '显示名称',
  `api_key_encrypted` VARCHAR(500) DEFAULT NULL COMMENT '加密后的API Key',
  `base_url` VARCHAR(200) DEFAULT NULL COMMENT 'API基础地址',
  `default_model` VARCHAR(100) DEFAULT NULL COMMENT '默认模型',
  `status` ENUM('active', 'inactive', 'error') NOT NULL DEFAULT 'active' COMMENT '状态',
  `rate_limit` INT UNSIGNED NOT NULL DEFAULT 60 COMMENT '每分钟请求限制',
  `priority` INT NOT NULL DEFAULT 0 COMMENT '优先级(越大越高)',
  `config` JSON DEFAULT NULL COMMENT '扩展配置',
  `total_calls` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总调用次数',
  `total_tokens` BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '总消耗token',
  `total_cost_points` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '总消耗圣点',
  `last_error` VARCHAR(500) DEFAULT NULL COMMENT '最近错误信息',
  `last_health_check` TIMESTAMP NULL DEFAULT NULL COMMENT '最近健康检查时间',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ai_providers_name` (`name`),
  KEY `idx_ai_providers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI Provider配置表';

-- ============================================================
-- 初始化4个Provider记录
-- ============================================================

INSERT INTO `ai_providers` (`name`, `display_name`, `base_url`, `default_model`, `status`, `rate_limit`, `priority`) VALUES
('doubao', '豆包（字节跳动）', 'https://ark.cn-beijing.volces.com/api/v3', 'doubao-pro-32k', 'active', 60, 3),
('jimeng', '即梦AI绘画', 'https://jimeng.jianying.com/v1', 'jimeng-v2', 'active', 30, 2),
('openai', 'OpenAI GPT', 'https://api.openai.com/v1', 'gpt-4o', 'active', 30, 4),
('tongyi', '通义千问', 'https://dashscope.aliyuncs.com/api/v1', 'qwen-plus', 'active', 60, 3)
ON DUPLICATE KEY UPDATE `display_name` = VALUES(`display_name`);

-- ============================================================
-- AI工具表扩展字段（如果不存在则添加）
-- ============================================================

-- 确保 ai_tools 表有 provider 和 model_id 字段（现有表已包含，此仅做验证）
-- ALTER TABLE `ai_tools` ADD COLUMN IF NOT EXISTS `provider` VARCHAR(50) NOT NULL DEFAULT '' COMMENT 'Provider标识';
-- ALTER TABLE `ai_tools` ADD COLUMN IF NOT EXISTS `model_id` VARCHAR(100) NOT NULL DEFAULT '' COMMENT '模型ID';
