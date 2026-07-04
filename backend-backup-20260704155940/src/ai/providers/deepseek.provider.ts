/**
 * DeepSeek Provider
 * 官网：https://platform.deepseek.com
 * API兼容OpenAI格式，使用 deepseek-chat / deepseek-coder 模型
 */
import { OpenAIProvider } from './openai.provider';
import type { ModelInfo } from './ai-provider.interface';

export class DeepSeekProvider extends OpenAIProvider {
  readonly name = 'deepseek';
  readonly displayName = 'DeepSeek';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        capabilities: ['text', 'code'],
        maxContextLength: 64000,
        supportStream: true,
        inputPrice: 1,
        outputPrice: 2,
      },
      {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        capabilities: ['text', 'code'],
        maxContextLength: 64000,
        supportStream: true,
        inputPrice: 1,
        outputPrice: 2,
      },
    ];
  }
}
