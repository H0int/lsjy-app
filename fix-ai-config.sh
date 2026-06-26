#!/bin/bash
# ============================================
# 罗圣纪元 AI配置快速修复脚本
# 在ECS服务器上运行此脚本修复AI对话问题
# ============================================
set -e

echo "🔧 修复AI配置..."

APP_DIR=/opt/lsjy-app

if [ ! -d "$APP_DIR" ]; then
  echo "❌ 未找到应用目录: $APP_DIR"
  exit 1
fi

cd $APP_DIR/backend

# 备份当前.env
if [ -f .env ]; then
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
  echo "✅ 已备份当前.env"
fi

# 更新AI配置
cat >> .env << 'EOF'

# ===== AI配置（修复AI对话问题）=====
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e
EOF

echo "✅ AI配置已更新"

# 重启后端服务
echo "🔄 重启后端服务..."
pm2 restart lsjy-backend 2>/dev/null || pm2 start dist/src/main.js --name lsjy-backend

echo ""
echo "============================================"
echo "✅ AI配置修复完成！"
echo "============================================"
echo "📍 主Provider: DeepSeek"
echo "📍 备用Provider: 豆包、通义千问"
echo "🔄 服务已重启"
echo ""
echo "测试命令:"
echo "curl -X POST http://localhost:3000/api/v1/ai/tools/2/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"messages\":[{\"role\":\"user\",\"content\":\"你好\"}]}'"
echo "============================================"
