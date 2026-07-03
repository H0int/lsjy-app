#!/bin/bash
# ============================================
# 罗圣纪元 - 快速修复404问题
# 在ECS服务器上运行: bash quick-fix.sh
# ============================================
set -e

echo "🔧 快速修复404问题..."
echo "============================================"

# 检查是否在正确的目录
if [ ! -d "/opt/lsjy-app/backend" ]; then
    echo "❌ 错误: 未找到 /opt/lsjy-app/backend"
    exit 1
fi

cd /opt/lsjy-app/backend

# ============================================
# 1. 确保后端服务运行
# ============================================
echo "📦 检查后端服务..."

# 检查PM2是否运行
if ! pm2 status > /dev/null 2>&1; then
    echo "启动PM2..."
    pm2 start dist/src/main.js --name lsjy-backend
    sleep 2
fi

# 检查后端是否在线
if ! pm2 status | grep -q "lsjy-backend.*online"; then
    echo "重启后端服务..."
    pm2 delete lsjy-backend 2>/dev/null || true
    pm2 start dist/src/main.js --name lsjy-backend
    sleep 3
fi

echo "✅ 后端服务状态:"
pm2 status | grep lsjy-backend

# ============================================
# 2. 确保.env配置正确
# ============================================
echo ""
echo "📝 检查环境配置..."

if [ ! -f .env ]; then
    echo "创建.env文件..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
JWT_SECRET=lsjy-jwt-secret-2026-rosheng
JWT_EXPIRES_IN=7d

# AI配置
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e

# 管理员
ADMIN_USERNAME=KF02V9
ADMIN_PASSWORD=LuoKaiZhong02V9
EOF
    echo "✅ .env已创建"

    # 重启服务以加载新配置
    pm2 restart lsjy-backend
    sleep 2
else
    echo "✅ .env已存在"

    # 确保AI配置存在
    if ! grep -q "AI_PROVIDER" .env; then
        echo "添加AI配置..."
        cat >> .env << 'EOF'

# AI配置
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e
EOF
        pm2 restart lsjy-backend
        sleep 2
    fi
fi

# ============================================
# 3. 测试API
# ============================================
echo ""
echo "🧪 测试API..."

# 测试健康检查
HEALTH=$(curl -s http://localhost:3000/api/v1/health 2>/dev/null | head -c 100)
if [ -n "$HEALTH" ]; then
    echo "✅ API健康检查: $HEALTH"
else
    echo "⚠️  API健康检查失败，查看日志:"
    pm2 logs lsjy-backend --lines 10 --nostream
fi

# 测试AI对话
echo ""
echo "测试AI对话..."
AI_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/ai/tools/2/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"你好"}]}' 2>/dev/null)

if echo "$AI_RESPONSE" | grep -q '"code":0'; then
    echo "✅ AI对话正常"
    echo "响应: $(echo $AI_RESPONSE | head -c 150)..."
else
    echo "⚠️  AI对话异常"
    echo "响应: $AI_RESPONSE"
fi

# ============================================
# 4. 检查Nginx配置
# ============================================
echo ""
echo "🔍 检查Nginx..."

if command -v nginx &> /dev/null; then
    # 检查nginx配置
    if [ -f "/etc/nginx/conf.d/lsjyapp.conf" ]; then
        echo "✅ Nginx配置文件存在"
    else
        echo "⚠️  Nginx配置文件不存在"
        echo "请运行: sudo cp /opt/lsjy-app/nginx.conf /etc/nginx/conf.d/lsjyapp.conf"
    fi

    # 检查前端文件
    if [ -d "/usr/share/nginx/html/frontend" ]; then
        FILE_COUNT=$(ls -1 /usr/share/nginx/html/frontend/ 2>/dev/null | wc -l)
        echo "✅ 前端文件: $FILE_COUNT 个文件"
    else
        echo "⚠️  前端目录不存在"
        echo "请运行完整部署: bash /opt/lsjy-app/full-deploy.sh"
    fi

    if [ -d "/usr/share/nginx/html/admin" ]; then
        FILE_COUNT=$(ls -1 /usr/share/nginx/html/admin/ 2>/dev/null | wc -l)
        echo "✅ 管理后台文件: $FILE_COUNT 个文件"
    else
        echo "⚠️  管理后台目录不存在"
        echo "请运行完整部署: bash /opt/lsjy-app/full-deploy.sh"
    fi
else
    echo "⚠️  Nginx未安装"
fi

# ============================================
# 5. 显示访问信息
# ============================================
echo ""
echo "============================================"
echo "✅ 修复完成！"
echo "============================================"
echo ""
echo "📍 访问地址："
echo "   前台: https://lsjyapp.cn"
echo "   后台: https://h0int.github.io/lsjy-app/#/admin/login"
echo "   API:  https://api.lsjyapp.cn/api/v1/health"
echo ""
echo "🔑 管理员账号："
echo "   用户名: KF02V9"
echo "   密码: LuoKaiZhong02V9"
echo ""
echo "📊 服务状态："
pm2 status | grep lsjy-backend
echo ""
echo "🔍 查看日志: pm2 logs lsjy-backend --lines 50"
echo ""
echo "============================================"
echo ""
echo "如果仍然404，请运行完整部署:"
echo "  bash /opt/lsjy-app/full-deploy.sh"
echo ""
