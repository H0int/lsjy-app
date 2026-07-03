import { OpenAIProvider } from './openai.provider';
import type { ModelInfo } from './ai-provider.interface';

export interface OpenAICompatibleProviderOptions {
  name: string;
  displayName: string;
  models: ModelInfo[];
}

/**
 * OpenAI 兼容接口 Provider
 * 适用于硅基流动、Kimi、智谱、百炼、火山方舟、魔搭社区、龙虾AI等兼容 /chat/completions 的平台。
 */
export class OpenAICompatibleProvider extends OpenAIProvider {
  readonly name: string;
  readonly displayName: string;
  readonly capabilities: ('text' | 'image')[] = ['text'];
  private readonly modelList: ModelInfo[];

  constructor(options: OpenAICompatibleProviderOptions) {
    super();
    this.name = options.name;
    this.displayName = options.displayName;
    this.modelList = options.models;
  }

  async getModels(): Promise<ModelInfo[]> {
    return this.modelList;
  }
}
