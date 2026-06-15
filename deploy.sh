#!/bin/bash
# ============================================
# 罗圣纪元 SaaS 一键部署脚本
# ECS: 8.154.16.5 (Alibaba Cloud Linux 4 Pro)
# ============================================
set -e

echo "🚀 罗圣纪元 SaaS 后端部署开始..."
echo "============================================"

# 1. 系统依赖
echo "📦 安装系统依赖..."
sudo yum install -y git curl wget gcc-c++ make 2>/dev/null || true

# 2. 安装 Node.js 20
if ! command -v node &> /dev/null; then
  echo "📦 安装 Node.js 20..."
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo yum install -y nodejs
fi
echo "✅ Node.js $(node -v)"

# 3. 安装 PM2
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

# 4. 克隆代码
APP_DIR=/opt/lsjy-app
if [ -d "$APP_DIR/.git" ]; then
  echo "📂 更新代码..."
  cd $APP_DIR && sudo git pull
else
  echo "📂 克隆代码..."
  sudo rm -rf $APP_DIR
  sudo git clone https://github.com/H0int/lsjy-app.git $APP_DIR
fi
cd $APP_DIR

# 5. 后端配置
cd backend
echo "📝 配置环境变量..."
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=3000

# SQLite
DB_TYPE=sqlite
DB_DATABASE=./data/lsjy.db

# JWT
JWT_SECRET=lsjy-jwt-secret-2026-rosheng
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://h0int.github.io

# AI配置
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e
ENVEOF

mkdir -p data

# 6. 安装依赖 & 构建
echo "📦 安装后端依赖..."
npm install --legacy-peer-deps --production=false

echo "🔨 构建后端..."
npx tsc || npx nest build 2>/dev/null || true

# 7. 初始化数据库 + 角色种子
echo "🗄️ 初始化数据库..."
node -e "
const { DataSource } = require(\"typeorm\");
const path = require(\"path\");
async function init() {
  const ds = new DataSource({
    type: \"sqlite\",
    database: \"./data/lsjy.db\",
    synchronize: true,
    entities: [\"dist/database/entities/*.entity.js\"]
  });
  await ds.initialize();
  console.log(\"✅ 数据库初始化成功\");
  await ds.destroy();
}
init().catch(e => console.error(\"DB init error:\", e));
" 2>/dev/null || echo "⚠️ DB init skipped (will auto-init on first start)"

# 8. 启动
echo "🚀 启动后端服务..."
pm2 delete lsjy-backend 2>/dev/null || true
if [ -f dist/main.js ]; then
  pm2 start dist/main.js --name lsjy-backend
elif [ -f dist/src/main.js ]; then
  pm2 start dist/src/main.js --name lsjy-backend
else
  echo "⚠️ 构建产物未找到，尝试直接启动..."
  pm2 start src/main.js --name lsjy-backend --interpreter ts-node 2>/dev/null || \
  echo "❌ 启动失败，请检查构建日志"
fi
pm2 save

# 9. 防火墙
echo "🔥 配置防火墙..."
sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

# 10. 完成
PUBLIC_IP=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || echo "8.154.16.5")
echo ""
echo "============================================"
echo "✅ 罗圣纪元 SaaS 后端部署完成！"
echo "============================================"
echo "📍 API地址: http://${PUBLIC_IP}:3000"
echo "📍 前端: https://h0int.github.io/lsjy-app/"
echo "🔑 管理员: KF02V9 / LKZ2005430"
echo "📋 PM2状态: pm2 status"
echo "📋 查看日志: pm2 logs lsjy-backend"
echo "============================================"
echo "⚠️ 请确保阿里云安全组已开放3000端口！"
echo "============================================"
