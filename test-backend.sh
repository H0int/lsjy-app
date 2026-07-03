#!/bin/bash
# 测试后端API和AI服务
# 在ECS服务器上运行

echo "🧪 测试后端API..."
echo "============================================"

API_BASE="http://localhost:3000/api/v1"

# 1. 健康检查
echo "1. 健康检查..."
curl -s "$API_BASE/health" | jq . || echo "❌ 健康检查失败"
echo ""

# 2. 测试登录
echo "2. 测试登录..."
LOGIN_RESULT=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"KF02V9","password":"LuoKaiZhong02V9"}')

echo "$LOGIN_RESULT" | jq .

# 提取token
TOKEN=$(echo "$LOGIN_RESULT" | jq -r '.data.accessToken')
echo "Token: $TOKEN"
echo ""

# 3. 测试AI对话
echo "3. 测试AI对话..."
AI_RESULT=$(curl -s -X POST "$API_BASE/ai/tools/2/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"messages":[{"role":"user","content":"罗圣纪元的创始人是谁？"}]}')

echo "$AI_RESULT" | jq .

# 检查是否返回正确的创始人信息
if echo "$AI_RESULT" | grep -q "罗凯中"; then
    echo "✅ AI正确回答创始人是罗凯中"
else
    echo "❌ AI回答错误，未提及罗凯中"
fi
echo ""

# 4. 测试余额查询
echo "4. 测试余额查询..."
curl -s "$API_BASE/payment/coin/balance" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 5. 测试充值套餐
echo "5. 测试充值套餐..."
curl -s "$API_BASE/payment/coin/packages" | jq .
echo ""

# 6. 检查AI Provider状态
echo "6. AI Provider状态..."
curl -s "$API_BASE/ai/providers" | jq .
echo ""

echo "============================================"
echo "✅ 测试完成"
