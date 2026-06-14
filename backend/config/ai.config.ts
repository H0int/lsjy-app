/**
 * AI Provider 配置
 * 集中管理所有大模型服务商的配置
 */
import { registerAs } from '@nestjs/config';

export const AIConfig = registerAs('ai', () => ({
  // 全局设置
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),

  // 豆包（字节跳动火山引擎）
  doubao: {
    apiKey: process.env.DOUBAO_API_KEY || '',
    baseUrl: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: process.env.DOUBAO_MODEL || 'doubao-pro-32k',
  },

  // 即梦（字节跳动AI绘画）
  jimeng: {
    apiKey: process.env.JIMENG_API_KEY || '',
    baseUrl: process.env.JIMENG_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: process.env.JIMENG_MODEL || 'doubao-seedream-5-0-lite',
  },

  // OpenAI GPT
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    defaultModel: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  // 通义千问（龙虾AI）
  tongyi: {
    apiKey: process.env.TONGYI_API_KEY || '',
    baseUrl: process.env.TONGYI_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
    defaultModel: process.env.TONGYI_MODEL || 'qwen-plus',
  },

  // 智能路由配置
  routing: {
    'text-generation': ['doubao', 'openai', 'tongyi'],
    'image-generation': ['jimeng', 'openai'],
    'code-generation': ['openai', 'doubao', 'tongyi'],
    'text-analysis': ['tongyi', 'doubao', 'openai'],
    'multimodal': ['openai'],
  },

  // 计费配置（圣点/token 换算）
  pricing: {
    // 每千token对应的圣点数
    coinsPerKToken: {
      'doubao-pro-32k': { input: 0.8, output: 2.0 },
      'doubao-pro-128k': { input: 1.0, output: 2.5 },
      'doubao-lite-32k': { input: 0.3, output: 0.6 },
      'gpt-4': { input: 20, output: 60 },
      'gpt-4-turbo': { input: 10, output: 30 },
      'gpt-4o': { input: 5, output: 15 },
      'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
      'qwen-turbo': { input: 0.3, output: 0.6 },
      'qwen-plus': { input: 0.8, output: 2.0 },
      'qwen-max': { input: 2.0, output: 6.0 },
    },
    // 图像生成固定价格（圣点/张）
    imageFixedPrice: {
      'doubao-seedream-5-0-lite': 10,
      'doubao-seedream-5-0-lite-pro': 20,
      'dall-e-3': 40,
    },
  },
}));
