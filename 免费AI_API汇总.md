# 国内外免费AI API 汇总

> 整理时间：2026年6月
> 用途：罗圣纪元平台可集成的免费AI API资源

---

## 🇨🇳 国内免费API（中文友好，无需科学上网）

### 1. 百度智能云 · 文心一言
- **官网**: https://cloud.baidu.com/product/wenxinworkshop
- **免费模型**: 
  - ERNIE-3.5-8K：**永久免费**，不限量（QPS限制50）
  - ERNIE-Lite：免费
- **特点**: 中文理解能力强，支持函数调用
- **API格式**: 非OpenAI兼容，需使用百度SDK

### 2. 阿里云百炼 · 通义千问
- **官网**: https://bailian.console.aliyun.com
- **免费额度**:
  - 新人注册赠 **100万Token**（有效期90天）
  - Qwen Code：**每日2000次免费**
  - Qwen2.5-7B：有免费额度
- **支持模型**: Qwen3-8B、Qwen2.5-7B、Qwen Code、Qwen-Math、Qwen-Omni（多模态）
- **API格式**: OpenAI兼容
- **Base URL**: `https://dashscope.aliyuncs.com/compatible-mode/v1`

### 3. 智谱AI · 智谱清言
- **官网**: https://open.bigmodel.cn
- **免费模型**:
  - GLM-4-Flash：**完全免费**，永久使用
  - GLM-4-FlashX：免费
- **限制**: 并发数限制为5
- **特点**: 支持联网搜索、可微调
- **API格式**: OpenAI兼容
- **Base URL**: `https://open.bigmodel.cn/api/paas/v4`

### 4. 硅基流动 SiliconFlow
- **官网**: https://siliconflow.cn
- **免费额度**:
  - 新用户注册赠 **2000万Token**
  - 多个开源模型免费调用
- **支持模型**: DeepSeek V3/R1、Qwen2.5系列、Llama3系列、Mistral等
- **特点**: 模型丰富，价格便宜，速度快
- **API格式**: OpenAI兼容
- **Base URL**: `https://api.siliconflow.cn/v1`

### 5. 腾讯云 · 混元大模型
- **官网**: https://cloud.tencent.com/product/hunyuan
- **免费额度**:
  - 混元系列：**100万tokens** 共享消耗额度（有效期1年）
  - hunyuan-embedding：100万tokens（有效期1年）
- **特点**: 腾讯出品，中文能力强
- **API格式**: 需确认

### 6. 魔搭社区 ModelScope
- **官网**: https://www.modelscope.cn
- **免费额度**:
  - 每日总计 **2000次** API调用
  - 单个模型每日上限 **500次**
- **支持模型**: 大量开源模型（通义千问、Llama、Qwen等）
- **限制**: 需绑定阿里云账号
- **API格式**: OpenAI兼容
- **Base URL**: `https://api-inference.modelscope.cn/v1`

### 7. 讯飞星火
- **官网**: https://xinghuo.xfyun.cn
- **免费模型**:
  - 讯飞星火 Lite：**永久免费**，包含联网搜索能力
- **特点**: 支持联网搜索，语音能力强
- **API格式**: 需使用讯飞SDK（WebSocket）

### 8. 字节跳动 · 火山方舟
- **官网**: https://www.volcengine.com/product/ark
- **免费额度**:
  - **每个模型每天免费250万Token**
  - 多个模型可切换使用
- **支持模型**: 豆包系列（Doubao-pro、Doubao-lite等）
- **特点**: 速度快，体验好
- **API格式**: OpenAI兼容
- **Base URL**: `https://ark.cn-beijing.volces.com/api/v3`

### 9. Kimi · 月之暗面
- **官网**: https://www.moonshot.cn
- **免费额度**: 新用户有免费试用额度
- **特点**: 长上下文能力强（128K），文件解析能力强
- **API格式**: OpenAI兼容
- **Base URL**: `https://api.moonshot.cn/v1`

---

## 🌍 国外免费API（需科学上网）

### 1. Google Gemini API ⭐ 推荐
- **官网**: https://ai.google.dev
- **免费额度**:
  - Gemini 2.5 Flash：**每日1500次请求**，100万tokens/分钟
  - Gemini 1.5 Pro：每日100次请求
- **特点**: 
  - 多模态支持（文本、图片、音频、视频）
  - 超长上下文（最高1M tokens）
  - 免费额度非常慷慨
- **API格式**: Google官方格式，有SDK

### 2. Groq ⚡ 速度最快
- **官网**: https://groq.com
- **免费额度**:
  - 每日 **14400次** 调用
  - 30,000 tokens/分钟
- **支持模型**: Llama 3.1系列、Mixtral、Gemma等
- **特点**: 推理速度极快（亚秒级响应）
- **API格式**: OpenAI兼容
- **Base URL**: `https://api.groq.com/openai/v1`

### 3. OpenAI
- **官网**: https://platform.openai.com
- **免费额度**: 
  - 新用户有5美元免费额度（有效期3个月）
  - 免费层：3 RPM，仅支持GPT-3.5
- **特点**: 模型质量高，生态完善
- **API格式**: OpenAI兼容（标准）
- **Base URL**: `https://api.openai.com/v1`

### 4. Hugging Face Inference API
- **官网**: https://huggingface.co
- **免费额度**:
  - 每小时 **3次** 免费推理
  - 大量开源模型可用
- **支持模型**: Mistral、Llama、Qwen等数千个开源模型
- **特点**: 模型最丰富，适合研究和测试
- **API格式**: 多种格式

### 5. Anthropic Claude
- **官网**: https://www.anthropic.com
- **免费额度**: 新用户有免费试用额度（5美元）
- **特点**: 长上下文，安全性高
- **API格式**: 官方格式

### 6. Together AI
- **官网**: https://www.together.ai
- **免费额度**: 新用户有25美元免费额度
- **支持模型**: Llama、Mistral、Qwen等开源模型
- **特点**: 速度快，模型多
- **API格式**: OpenAI兼容

---

## 📊 免费API对比表

| 厂商 | 免费力度 | 模型质量 | 速度 | 中文支持 | 推荐指数 |
|------|---------|---------|------|---------|---------|
| 硅基流动 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟🌟 |
| Google Gemini | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | 🌟🌟🌟🌟 |
| 智谱GLM-4-Flash | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 |
| Groq | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 🌟🌟🌟🌟 |
| 火山方舟 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟🌟 |
| 百度文心 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟⭐ |
| 魔搭社区 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🌟🌟🌟⭐ |
| 阿里云百炼 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟 |
| 讯飞星火Lite | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟🌟 |
| Kimi | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟🌟⭐ |
| OpenAI | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | 🌟🌟 |
| HuggingFace | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 🌟⭐ |

---

## 🚀 优先集成建议

### 第一梯队（必集成）
1. **硅基流动** - 免费额度大，模型丰富，中文好，OpenAI兼容
2. **智谱GLM-4-Flash** - 完全免费，永久使用
3. **Google Gemini** - 免费额度慷慨，多模态能力强
4. **火山方舟/豆包** - 速度快，中文好

### 第二梯队（建议集成）
5. **Groq** - 速度最快，适合实时对话
6. **百度文心** - 永久免费，中文理解强
7. **魔搭社区** - 模型多，适合测试
8. **阿里云百炼** - 新人额度高

### 第三梯队（可选）
9. 讯飞星火
10. Kimi
11. 腾讯混元
12. OpenAI
13. HuggingFace

---

## 📝 注意事项

1. **免费额度可能变化**: 各厂商的免费政策可能随时调整，建议定期检查
2. **速率限制**: 免费版通常有QPS/RPM限制，生产环境建议使用付费版
3. **数据隐私**: 使用免费API时注意数据隐私，敏感数据建议使用私有部署
4. **稳定性**: 免费服务的稳定性可能不如付费服务，建议做多Provider备份
5. **API格式**: 大部分新平台都支持OpenAI兼容格式，可以快速集成

---

## 🔧 集成方式

大部分API都支持OpenAI兼容格式，只需要：
1. 更换 base_url
2. 更换 api_key
3. 更换 model 名称

例如：
```javascript
// 硅基流动
const baseUrl = 'https://api.siliconflow.cn/v1';
const apiKey = 'sk-xxx';
const model = 'deepseek-ai/DeepSeek-V3';

// 智谱
const baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
const apiKey = 'xxx';
const model = 'glm-4-flash';
```
