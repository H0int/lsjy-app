#!/bin/bash
# 后端部署脚本 - 在ECS上执行
# 用法: ssh root@8.154.16.5 'bash /opt/lsjy-app/scripts/deploy-backend.sh'

set -e

APP_DIR="/opt/lsjy-app"

echo "=== 罗圣纪元 后端部署 ==="
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"

# 1. 拉取最新代码
echo "[1/4] 拉取最新代码..."
cd $APP_DIR
git pull origin main

# 2. 更新Nginx配置
echo "[2/4] 更新Nginx配置..."
cp $APP_DIR/nginx.conf /etc/nginx/conf.d/lsjyapp.conf
nginx -t && nginx -s reload
echo "  Nginx已重载"

# 3. 重新构建后端
echo "[3/4] 构建后端..."
cd $APP_DIR/backend
npm install --production=false
npm run build

# 4. 重启后端服务
echo "[4/4] 重启后端服务..."
pm2 restart lsjy-backend
sleep 3
pm2 status

echo ""
echo "=== 部署完成 ==="
echo "验证: curl -s https://api.lsjyapp.cn/api/v1/admin/dashboard"
