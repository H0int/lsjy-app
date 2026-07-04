#!/bin/bash
# 罗圣纪元 - 后端一键部署脚本
# 在你的电脑上运行此脚本，或通过阿里云ECS控制台的远程连接执行
#
# 使用方法：
# 方法1: 在你的终端运行: bash deploy.sh
# 方法2: SSH到服务器后运行: cd /opt/lsjy-app && bash backend/deploy.sh
# 方法3: 阿里云ECS控制台 → 实例 → 远程连接 → 粘贴以下命令

set -e

echo "🚀 罗圣纪元后端部署开始..."
echo "================================"

# 进入项目目录
cd /opt/lsjy-app

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
npm install --production

# 重启后端服务
echo "🔄 重启后端服务..."
if pm2 describe lsjy-backend > /dev/null 2>&1; then
    pm2 restart lsjy-backend
    echo "✅ 后端服务已重启"
else
    pm2 start server.js --name lsjy-backend
    echo "✅ 后端服务已启动"
fi

# 等待服务启动
sleep 3

# 验证服务状态
echo "🔍 验证服务状态..."
if curl -s http://localhost:3000/api/v1/health | grep -q "ok\|healthy\|200"; then
    echo "✅ 后端服务运行正常！"
else
    echo "⚠️  服务可能还在启动中，请稍后检查: curl http://8.154.16.5:3000/api/v1/health"
fi

echo ""
echo "================================"
echo "✅ 部署完成！"
echo "📊 管理后台: https://lsjyapp.cn"
echo "🔑 登录账号: KF02V9"
echo "================================"

# 显示PM2状态
pm2 status
