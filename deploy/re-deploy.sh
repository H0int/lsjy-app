#!/bin/bash
# 罗圣纪元 - 从Git备份恢复ECS配置
# 用法：在ECS上运行此脚本
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_DIR="/opt/lsjy-app/backup-$(date +%Y%m%d)"
echo "=== 罗圣纪元 ECS配置恢复 ==="
echo "备份现有配置到: $BACKUP_DIR"

# 备份当前配置
mkdir -p "$BACKUP_DIR"
cp /opt/lsjy-app/backend-nestjs/dist/ai/ai.controller.js "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/lsjy-app/backend-nestjs/dist/main.js "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/lsjy-app/backend-nestjs/dist/reports/reports.controller.js "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/lsjy-app/backend-nestjs/dist/users/users.controller.js "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/lsjy-app/backend-nestjs/dist/modules/agent-dispatch/agent-dispatch.controller.js "$BACKUP_DIR/" 2>/dev/null || true
cp /opt/ai-proxy/dist/config.js "$BACKUP_DIR/ai-proxy-config.js" 2>/dev/null || true
cp /etc/nginx/conf.d/lsjy.conf "$BACKUP_DIR/nginx-lsjy.conf" 2>/dev/null || true

# 恢复配置
echo "恢复配置..."
cp "$SCRIPT_DIR/ecs-live-config/backend-nestjs/ai.controller.js" /opt/lsjy-app/backend-nestjs/dist/ai/ai.controller.js
cp "$SCRIPT_DIR/ecs-live-config/backend-nestjs/main.js" /opt/lsjy-app/backend-nestjs/dist/main.js
cp "$SCRIPT_DIR/ecs-live-config/backend-nestjs/reports.controller.js" /opt/lsjy-app/backend-nestjs/dist/reports/reports.controller.js
cp "$SCRIPT_DIR/ecs-live-config/backend-nestjs/users.controller.js" /opt/lsjy-app/backend-nestjs/dist/users/users.controller.js
cp "$SCRIPT_DIR/ecs-live-config/backend-nestjs/agent-dispatch.controller.js" /opt/lsjy-app/backend-nestjs/dist/modules/agent-dispatch/agent-dispatch.controller.js
cp "$SCRIPT_DIR/ecs-live-config/ai-proxy/config.js" /opt/ai-proxy/dist/config.js
cp "$SCRIPT_DIR/ecs-live-config/nginx-lsjy.conf" /etc/nginx/conf.d/lsjy.conf

# 重启服务
echo "重启服务..."
nginx -t && nginx -s reload
pm2 restart ai-proxy
pm2 restart lsjy-backend

echo "=== 恢复完成 ==="
echo "验证: curl -s https://api.lsjyapp.cn/api/v1/ai/models | head -c 200"
