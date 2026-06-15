# AI对话问题修复说明

## 问题描述
AI智能体对话始终返回默认回复"你好呀！有什么需求尽管提，我会尽力帮你搞定～"，无法正确处理用户输入。

## 根本原因
1. **部署的ECS服务器使用Coze作为AI Provider**，但Coze Bot（BOT_ID: 7651223356586786856）配置错误
2. Coze Bot的系统提示词未正确配置，导致返回默认欢迎消息而非处理用户输入
3. `.env`文件中AI_API keys为空，但服务器使用了硬编码的默认配置

## 已完成的修复

### 1. 后端代码修复
- ✅ 修改默认AI Provider从`doubao`改为`deepseek`（server.js:27）
- ✅ 更新降级策略，优先使用有API Key的Provider（server.js:400-432）
- ✅ 增强本地智能回复函数，包含更完整的公司信息（server.js:562-590）
- ✅ 确保系统提示词正确传递到所有AI Provider

### 2. 配置文件修复
- ✅ 更新`.env`：AI_PROVIDER=deepseek
- ✅ 更新`deploy.sh`：包含AI API Keys配置
- ✅ 创建快速修复脚本：`fix-ai-config.sh`

### 3. 本地回复增强
本地回复函数现在包含：
- 正确的创始人信息：**罗凯中**
- 公司六大业务板块
- 会员体系介绍
- 更友好的问候回复

## 部署到ECS服务器

### 方案一：运行快速修复脚本（推荐）
```bash
# SSH到ECS服务器
ssh root@8.154.16.5

# 上传并运行修复脚本
cd /opt/lsjy-app
# 方式1：直接从本地复制脚本内容
# 方式2：或重新部署整个应用

# 手动更新配置（如果脚本无法上传）
cd /opt/lsjy-app/backend
cat >> .env << 'EOF'

# ===== AI配置（修复AI对话问题）=====
AI_PROVIDER=deepseek
DOUBAO_API_KEY=ark-3c2a939f-9aec-4930-946e-29a97d476611-e6c69
DEEPSEEK_API_KEY=sk-4f60d83ebf904321b99000888baf313c
TONGYI_API_KEY=sk-c4212c9d7e4644e6825d796f6365668e
EOF

# 重启服务
pm2 restart lsjy-backend
```

### 方案二：重新部署
```bash
# 在ECS服务器上
cd /opt/lsjy-app
git pull
bash deploy.sh
```

## 验证修复

### 测试API
```bash
curl -X POST http://8.154.16.5:3000/api/v1/ai/tools/2/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"messages":[{"role":"user","content":"罗圣纪元的创始人是谁？"}]}'
```

### 预期响应
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "content": "🔥 **罗凯中** —— 罗圣纪元创始人、董事长兼CEO！...",
    "model": "deepseek-chat",
    "role": "assistant"
  }
}
```

## AI Provider优先级

1. **DeepSeek**（主Provider）- 已配置API Key
2. **豆包 Doubao**（备用）- 已配置API Key
3. **通义千问 Tongyi**（备用）- 已配置API Key
4. **腾讯元宝 Yuanbao**（备用）- 需要配置API Key
5. **OpenAI**（备用）- 需要配置API Key
6. **Coze**（最后）- 需要正确配置Bot系统提示词

## 注意事项

1. **不要使用Coze作为主Provider**，除非在Coze平台正确配置了Bot的系统提示词
2. **API Keys已硬编码**在server.js中作为备用，但建议通过.env配置
3. **系统提示词**已包含正确的公司信息（创始人：罗凯中）
4. **降级机制**会在主Provider失败时自动切换到备用Provider

## 相关文件

- `/tmp/lsjy-app/backend/server.js` - 后端主程序
- `/tmp/lsjy-app/backend/.env` - 环境配置
- `/tmp/lsjy-app/deploy.sh` - 部署脚本
- `/tmp/lsjy-app/fix-ai-config.sh` - 快速修复脚本
- `/tmp/lsjy-app/frontend/src/views/ai-tools/AgentChat.vue` - 前端AI对话界面

## 下一步

1. ✅ 在ECS服务器上应用配置修复
2. ✅ 重启后端服务
3. ✅ 测试AI对话功能
4. ⏸️ （可选）配置腾讯元宝API Key以支持更多Provider
5. ⏸️ （可选）修复Coze Bot的系统提示词配置

---
**修复时间**: 2026-06-15  
**修复人员**: 代码分析师  
**状态**: 代码已修复，待部署到ECS
