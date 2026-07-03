#!/bin/bash
# ============================================
# 罗圣纪元 SaaS 完整部署脚本
# 解决404问题 - 一键部署前后端+API
# ============================================
set -e

echo "🚀 罗圣纪元 SaaS 完整部署开始..."
echo "============================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

# 检查是否在ECS上运行
if [ ! -d "/opt/lsjy-app" ]; then
    log_error "未找到 /opt/lsjy-app，请先克隆代码仓库"
    exit 1
fi

cd /opt/lsjy-app

# ============================================
# 1. 构建前端
# ============================================
log_info "构建前端..."

# 构建用户前台
if [ -d "frontend" ]; then
    cd frontend
    npm install --legacy-peer-deps
    npm run build
    log_info "用户前台构建完成"
    cd ..
else
    log_warn "frontend目录不存在，跳过"
fi

# 构建管理后台
if [ -d "admin" ]; then
    cd admin
    npm install --legacy-peer-deps
    npm run build
    log_info "管理后台构建完成"
    cd ..
else
    log_warn "admin目录不存在，跳过"
fi

# ============================================
# 2. 部署前端文件到Nginx目录
# ============================================
log_info "部署前端文件..."

# 创建Nginx目录
sudo mkdir -p /usr/share/nginx/html/frontend
sudo mkdir -p /usr/share/nginx/html/admin

# 部署用户前台
if [ -d "frontend/dist" ]; then
    sudo rm -rf /usr/share/nginx/html/frontend/*
    sudo cp -r frontend/dist/* /usr/share/nginx/html/frontend/
    log_info "用户前台已部署到 /usr/share/nginx/html/frontend"
else
    log_warn "frontend/dist不存在，跳过部署"
fi

# 部署管理后台
if [ -d "admin/dist" ]; then
    sudo rm -rf /usr/share/nginx/html/admin/*
    sudo cp -r admin/dist/* /usr/share/nginx/html/admin/
    log_info "管理后台已部署到 /usr/share/nginx/html/admin"
else
    log_warn "admin/dist不存在，跳过部署"
fi

# ============================================
# 3. 配置后端
# ============================================
log_info "配置后端..."

cd backend

# 安装依赖
npm install --legacy-peer-deps
log_info "后端依赖安装完成"

# 创建数据目录
mkdir -p data

# 创建.env文件（如果不存在）
if [ ! -f .env ]; then
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=lsjy-jwt-secret-2026-rosheng
JWT_EXPIRES_IN=7d

# AI配置 - 使用DeepSeek作为主Provider
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e

# 管理员账号
ADMIN_USERNAME=KF02V9
ADMIN_PASSWORD=LuoKaiZhong02V9
EOF
    log_info "后端.env配置已创建"
else
    log_info "后端.env已存在，检查AI配置..."

    # 确保AI配置存在
    if ! grep -q "AI_PROVIDER" .env; then
        cat >> .env << 'EOF'

# AI配置 - 使用DeepSeek作为主Provider
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e
EOF
        log_info "AI配置已添加到.env"
    fi
fi

# ============================================
# 4. 启动后端服务（使用PM2）
# ============================================
log_info "启动后端服务..."

# 安装PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_info "PM2已安装"
fi

# 停止旧的服务
pm2 delete lsjy-backend 2>/dev/null || true

# 启动新的服务
pm2 start server.js --name lsjy-backend --node-args="--max-old-space-size=512"
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

log_info "后端服务已启动"

# 等待服务启动
sleep 3

# 检查服务状态
if pm2 status | grep -q "lsjy-backend.*online"; then
    log_info "后端服务运行正常"
else
    log_error "后端服务启动失败"
    pm2 logs lsjy-backend --lines 20 --nostream
    exit 1
fi

# ============================================
# 5. 配置Nginx
# ============================================
log_info "配置Nginx..."

# 复制nginx配置
if [ -f "../nginx.conf" ]; then
    sudo cp ../nginx.conf /etc/nginx/conf.d/lsjyapp.conf
    log_info "Nginx配置已复制"
else
    log_warn "nginx.conf不存在，跳过配置"
fi

# 测试Nginx配置
sudo nginx -t
if [ $? -eq 0 ]; then
    log_info "Nginx配置测试通过"
    sudo systemctl reload nginx
    log_info "Nginx已重新加载"
else
    log_error "Nginx配置测试失败"
    exit 1
fi

# ============================================
# 6. 测试API
# ============================================
log_info "测试API..."

# 测试健康检查
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "200" ]; then
    log_info "API健康检查通过"
else
    log_warn "API健康检查返回: $HEALTH_CHECK"
fi

# 测试AI对话
AI_TEST=$(curl -s -X POST http://localhost:3000/api/v1/ai/tools/2/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"你好"}]}' 2>/dev/null | grep -o '"code":0' || echo "")

if [ -n "$AI_TEST" ]; then
    log_info "AI对话测试通过"
else
    log_warn "AI对话测试失败，请检查日志"
fi

# ============================================
# 7. 配置防火墙
# ============================================
log_info "配置防火墙..."

# 开放端口
sudo firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
sudo firewall-cmd --permanent --add-port=3000/tcp 2>/dev/null || true
sudo firewall-cmd --reload 2>/dev/null || true

log_info "防火墙配置完成"

# ============================================
# 完成
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "============================================"
echo ""
echo "📍 访问地址："
echo "   前台: https://lsjyapp.cn"
echo "   后台: https://admin.lsjyapp.cn"
echo "   API:  https://api.lsjyapp.cn"
echo ""
echo "🔑 管理员账号："
echo "   用户名: KF02V9"
echo "   密码: LuoKaiZhong02V9"
echo ""
echo "📊 服务状态："
echo "   查看日志: pm2 logs lsjy-backend"
echo "   重启服务: pm2 restart lsjy-backend"
echo "   查看状态: pm2 status"
echo ""
echo "🔍 故障排查："
echo "   1. 如果404，检查前端文件: ls -la /usr/share/nginx/html/"
echo "   2. 如果API 502，检查后端: pm2 status"
echo "   3. 如果AI不工作，检查配置: cat /opt/lsjy-app/backend/.env"
echo ""
echo "============================================"
