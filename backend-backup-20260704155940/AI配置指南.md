# 罗圣纪元 AI 模型配置指南

## 快速开始

### 1. 配置环境变量

```bash
cd backend
cp .env.example .env
# 编辑 .env 文件，填入真实的 API Key
```

### 2. 至少配置一个 AI 对话模型

推荐配置 **豆包** 或 **DeepSeek**（国内访问快，成本低）：

#### 豆包（字节跳动火山引擎）
1. 访问：https://console.volcengine.com/ark
2. 创建应用，获取 API Key
3. 填入 `.env`：
   ```
   DOUBAO_API_KEY=your_actual_key_here
   AI_PROVIDER=doubao
   ```

#### DeepSeek
1. 访问：https://platform.deepseek.com/
2. 注册账号，获取 API Key
3. 填入 `.env`：
   ```
   DEEPSEEK_API_KEY=your_actual_key_here
   AI_PROVIDER=deepseek
   ```

### 3. 配置图片生成（可选）

#### 即梦 AI 绘画（推荐）
1. 访问：https://jimeng.jianying.com/
2. 获取 API Key
3. 填入 `.env`：
   ```
   JIMENG_API_KEY=your_actual_key_here
   IMAGE_GENERATION_PROVIDER=jimeng
   ```

#### OpenAI DALL-E 3
1. 访问：https://platform.openai.com/
2. 获取 API Key
3. 填入 `.env`：
   ```
   OPENAI_API_KEY=your_actual_key_here
   IMAGE_GENERATION_PROVIDER=openai
   ```

### 4. 配置视频生成（可选）

#### 可灵 AI 视频（快手）
1. 访问：https://kling.kuaishou.com/
2. 获取 API Key
3. 填入 `.env`：
   ```
   KLING_API_KEY=your_actual_key_here
   VIDEO_GENERATION_PROVIDER=kling
   ```

### 5. 重启后端服务

```bash
cd backend
npm run start:dev
```

启动后会显示配置状态：
```
📊 AI 模型配置状态:
   主 Provider: doubao
   豆包 (Doubao): ✅ 已配置
   DeepSeek:  未配置
   ...
```

## 支持的 AI 模型

### 对话模型
| 模型 | Provider | 说明 |
|------|----------|------|
| 豆包 Pro 32K | doubao | 字节跳动，中文优秀 |
| DeepSeek Chat | deepseek | 国产开源，成本低 |
| 通义千问 Plus | tongyi | 阿里云，多模态 |
| 腾讯元宝 Pro | yuanbao | 腾讯，微信生态 |
| GPT-4o | openai | OpenAI 旗舰 |
| Coze 智能体 | coze | 扣子平台 |

### 图片生成模型
| 模型 | Provider | 说明 |
|------|----------|------|
| 即梦 AI 绘画 | jimeng | 字节跳动，中文理解好 |
| DALL-E 3 | openai | OpenAI 绘画 |

### 视频生成模型
| 模型 | Provider | 说明 |
|------|----------|------|
| 可灵 AI 视频 | kling | 快手，国内可用 |

## 自动降级机制

当主 Provider 配置失败或调用失败时，系统会自动降级到其他已配置的 Provider：

1. 尝试主 Provider（AI_PROVIDER 配置）
2. 失败后依次尝试：豆包 → DeepSeek → 通义千问 → 元宝 → OpenAI → Coze
3. 所有都失败才返回错误

## API 端点

### 对话
```
POST /api/v1/ai/tools/:toolId/chat
Body: { messages, model, temperature, maxTokens, systemPrompt }
```

### 图片生成
```
POST /api/v1/ai/tools/:toolId/generate
Body: { prompt, width, height, style, count }
Response: { urls: [...], model, prompt }
```

### 视频生成
```
POST /api/v1/ai/tools/:toolId/video
Body: { prompt, duration, resolution }
Response: { videoUrl, model, prompt, duration }
```

### 查看 Provider 状态
```
GET /api/v1/ai/providers
Response: [{ name, displayName, status, latencyMs }]
```

### 查看模型列表
```
GET /api/v1/ai/models
Response: [{ group, provider, models: [{ id, name, capabilities }] }]
```

## 故障排查

### 问题：AI 回复是模板内容（"这个问题很有意思..."）
**原因**：所有 AI Provider 都未配置或调用失败
**解决**：
1. 检查 `.env` 文件是否存在
2. 检查至少配置了一个 API Key
3. 重启后端服务
4. 查看启动日志中的配置状态

### 问题：图片生成返回 picsum.photos 链接
**原因**：使用了旧的假图片生成代码
**解决**：已修复，现在会调用真实的 AI 绘画 API

### 问题：视频生成不可用
**原因**：可灵 API Key 未配置
**解决**：在 `.env` 中配置 `KLING_API_KEY`

## 成本参考

| 模型 | 输入价格 | 输出价格 | 说明 |
|------|---------|---------|------|
| 豆包 Pro 32K | ¥0.0008/千 tokens | ¥0.002/千 tokens | 性价比高 |
| DeepSeek Chat | ¥0.001/千 tokens | ¥0.002/千 tokens | 便宜好用 |
| GPT-4o | $0.005/千 tokens | $0.015/千 tokens | 较贵 |
| 即梦 AI 绘画 | ¥0.1-0.3/张 | - | 按张计费 |
| 可灵 AI 视频 | ¥1-3/条 | - | 按条计费 |

## 安全提示

1. **不要** 将 `.env` 文件提交到 Git
2. **不要** 在代码中硬编码 API Key
3. 定期轮换 API Key
4. 使用环境变量管理敏感信息

## 联系支持

如有问题，请联系罗圣纪元技术支持团队。
