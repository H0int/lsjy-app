/**
 * AI Provider 管理器
 * 负责注册、发现、路由、负载均衡
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider, ProviderStatus, AIProviderError, AIErrorCode } from './ai-provider.interface';
import { DoubaoProvider } from './doubao.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { JimengProvider } from './jimeng.provider';
import { OpenAIProvider } from './openai.provider';
import { TongyiProvider } from './tongyi.provider';
import { OpenAICompatibleProvider } from './openai-compatible.provider';

/** 任务类型 → Provider优先级映射 */
const DEFAULT_ROUTING: Record<string, string[]> = {
  'text-generation': ['deepseek', 'siliconflow', 'kimi', 'zhipu', 'bailian', 'volcengine', 'longxia', 'modelscope', 'doubao', 'tongyi', 'openai'],
  'image-generation': ['jimeng', 'openai'],
  'code-generation': ['deepseek', 'siliconflow', 'kimi', 'zhipu', 'bailian', 'volcengine', 'longxia', 'modelscope', 'openai', 'doubao', 'tongyi'],
  'text-analysis': ['deepseek', 'siliconflow', 'kimi', 'zhipu', 'bailian', 'volcengine', 'longxia', 'modelscope', 'tongyi', 'doubao', 'openai'],
  'multimodal': ['openai'],
};

@Injectable()
export class AIProviderManager implements OnModuleInit {
  private readonly logger = new Logger(AIProviderManager.name);
  private readonly providers = new Map<string, IAIProvider>();
  private routing: Record<string, string[]> = { ...DEFAULT_ROUTING };

  /** 负载均衡状态跟踪 */
  private readonly lbCounters = new Map<string, number>();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.initializeProviders();
  }

  /**
   * 初始化所有Provider
   */
  private async initializeProviders(): Promise<void> {
    const providerConfigs = [
      {
        instance: new DeepSeekProvider(),
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
        defaultModel: this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
      },
      {
        instance: new DoubaoProvider(),
        apiKey: this.configService.get<string>('DOUBAO_API_KEY'),
        baseUrl: this.configService.get<string>('DOUBAO_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3'),
        defaultModel: this.configService.get<string>('DOUBAO_MODEL', 'doubao-pro-32k'),
      },
      {
        instance: new JimengProvider(),
        apiKey: this.configService.get<string>('JIMENG_API_KEY'),
        baseUrl: this.configService.get<string>('JIMENG_BASE_URL', 'https://jimeng.jianying.com/v1'),
        defaultModel: this.configService.get<string>('JIMENG_MODEL', 'jimeng-v2'),
      },
      {
        instance: new OpenAIProvider(),
        apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        baseUrl: this.configService.get<string>('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
        defaultModel: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o'),
      },
      {
        instance: new TongyiProvider(),
        apiKey: this.configService.get<string>('TONGYI_API_KEY'),
        baseUrl: this.configService.get<string>('TONGYI_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
        defaultModel: this.configService.get<string>('TONGYI_MODEL', 'qwen-plus'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'siliconflow',
          displayName: '硅基流动',
          models: [
            { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', capabilities: ['text', 'code'], supportStream: true },
            { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', capabilities: ['text', 'code'], supportStream: true },
            { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', capabilities: ['text'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('SILICONFLOW_API_KEY'),
        baseUrl: this.configService.get<string>('SILICONFLOW_BASE_URL', 'https://api.siliconflow.cn/v1'),
        defaultModel: this.configService.get<string>('SILICONFLOW_MODEL', 'deepseek-ai/DeepSeek-V3'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'kimi',
          displayName: 'Kimi',
          models: [
            { id: 'moonshot-v1-8k', name: 'Moonshot v1 8K', capabilities: ['text'], maxContextLength: 8192, supportStream: true },
            { id: 'moonshot-v1-32k', name: 'Moonshot v1 32K', capabilities: ['text'], maxContextLength: 32768, supportStream: true },
            { id: 'moonshot-v1-128k', name: 'Moonshot v1 128K', capabilities: ['text'], maxContextLength: 131072, supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('KIMI_API_KEY'),
        baseUrl: this.configService.get<string>('KIMI_BASE_URL', 'https://api.moonshot.cn/v1'),
        defaultModel: this.configService.get<string>('KIMI_MODEL', 'moonshot-v1-8k'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'zhipu',
          displayName: '智谱GLM',
          models: [
            { id: 'glm-4-flash', name: 'GLM-4-Flash', capabilities: ['text'], supportStream: true },
            { id: 'glm-4-plus', name: 'GLM-4-Plus', capabilities: ['text'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('ZHIPU_API_KEY'),
        baseUrl: this.configService.get<string>('ZHIPU_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4'),
        defaultModel: this.configService.get<string>('ZHIPU_MODEL', 'glm-4-flash'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'bailian',
          displayName: '阿里云百炼',
          models: [
            { id: 'qwen-turbo', name: 'Qwen Turbo', capabilities: ['text'], supportStream: true },
            { id: 'qwen-plus', name: 'Qwen Plus', capabilities: ['text'], supportStream: true },
            { id: 'qwen-max', name: 'Qwen Max', capabilities: ['text'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('BAILIAN_API_KEY'),
        baseUrl: this.configService.get<string>('BAILIAN_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
        defaultModel: this.configService.get<string>('BAILIAN_MODEL', 'qwen-plus'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'volcengine',
          displayName: '火山方舟',
          models: [
            { id: 'doubao-1-5-pro-32k-250115', name: 'Doubao 1.5 Pro 32K', capabilities: ['text'], supportStream: true },
            { id: 'doubao-1-5-lite-32k-250115', name: 'Doubao 1.5 Lite 32K', capabilities: ['text'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('VOLCENGINE_API_KEY'),
        baseUrl: this.configService.get<string>('VOLCENGINE_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3'),
        defaultModel: this.configService.get<string>('VOLCENGINE_MODEL', 'doubao-1-5-lite-32k-250115'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'modelscope',
          displayName: '魔搭社区',
          models: [
            { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5 72B', capabilities: ['text'], supportStream: true },
            { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3', capabilities: ['text', 'code'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('MODELSCOPE_API_KEY'),
        baseUrl: this.configService.get<string>('MODELSCOPE_BASE_URL', 'https://api-inference.modelscope.cn/v1'),
        defaultModel: this.configService.get<string>('MODELSCOPE_MODEL', 'Qwen/Qwen2.5-72B-Instruct'),
      },
      {
        instance: new OpenAICompatibleProvider({
          name: 'longxia',
          displayName: '龙虾AI',
          models: [
            { id: 'gpt-4o-mini', name: 'GPT-4o mini', capabilities: ['text'], supportStream: true },
            { id: 'gpt-4o', name: 'GPT-4o', capabilities: ['text', 'multimodal'], supportStream: true },
          ],
        }),
        apiKey: this.configService.get<string>('LONGXIA_API_KEY'),
        baseUrl: this.configService.get<string>('LONGXIA_BASE_URL', ''),
        defaultModel: this.configService.get<string>('LONGXIA_MODEL', 'gpt-4o-mini'),
      },
    ];

    for (const cfg of providerConfigs) {
      try {
        if (!cfg.apiKey) {
          this.logger.warn(`Provider ${cfg.instance.displayName} skipped: API key not configured`);
          continue;
        }
        if (!cfg.baseUrl) {
          this.logger.warn(`Provider ${cfg.instance.displayName} skipped: baseUrl not configured`);
          continue;
        }
        await cfg.instance.init({
          apiKey: cfg.apiKey,
          baseUrl: cfg.baseUrl,
          defaultModel: cfg.defaultModel,
          maxRetries: this.configService.get<number>('AI_MAX_RETRIES', 3),
          timeout: this.configService.get<number>('AI_TIMEOUT', 60000),
        });
        this.providers.set(cfg.instance.name, cfg.instance);
        this.logger.log(`Provider ${cfg.instance.displayName} initialized successfully`);
      } catch (err: any) {
        this.logger.error(`Failed to initialize provider ${cfg.instance.displayName}: ${err.message}`);
      }
    }

    this.logger.log(`AI Provider Manager: ${this.providers.size} providers active`);
  }

  /**
   * 注册Provider
   */
  registerProvider(name: string, provider: IAIProvider): void {
    this.providers.set(name, provider);
    this.logger.log(`Provider registered: ${name}`);
  }

  /**
   * 获取指定Provider
   */
  getProvider(name: string): IAIProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new AIProviderError(
        `Provider '${name}' not found. Available: ${this.getAvailableProviderNames().join(', ')}`,
        name,
        AIErrorCode.SERVICE_UNAVAILABLE,
      );
    }
    return provider;
  }

  /**
   * 获取所有已注册的Provider
   */
  getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 获取可用Provider名称列表
   */
  getAvailableProviderNames(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 智能路由：根据任务类型选择最佳Provider
   */
  routeRequest(taskType: string, preferredProvider?: string): IAIProvider {
    // 优先使用指定的provider
    if (preferredProvider && this.providers.has(preferredProvider)) {
      return this.providers.get(preferredProvider)!;
    }

    // 按路由表优先级选择
    const candidates = this.routing[taskType] || this.routing['text-generation'] || [];
    for (const name of candidates) {
      if (this.providers.has(name)) {
        return this.providers.get(name)!;
      }
    }

    // 兜底：返回第一个可用provider
    const first = this.providers.values().next();
    if (first.done) {
      throw new AIProviderError(
        'No AI providers available',
        'system',
        AIErrorCode.SERVICE_UNAVAILABLE,
      );
    }
    return first.value;
  }

  /**
   * 负载均衡：Round-Robin轮询
   */
  loadBalance(providerNames?: string[]): IAIProvider {
    const names = providerNames || this.getAvailableProviderNames();
    const availableNames = names.filter((n) => this.providers.has(n));

    if (availableNames.length === 0) {
      throw new AIProviderError(
        'No available providers for load balancing',
        'system',
        AIErrorCode.SERVICE_UNAVAILABLE,
      );
    }

    const key = availableNames.sort().join(',');
    const current = this.lbCounters.get(key) || 0;
    const selected = availableNames[current % availableNames.length];
    this.lbCounters.set(key, (current + 1) % availableNames.length);

    return this.providers.get(selected)!;
  }

  /**
   * 更新路由表
   */
  updateRouting(taskType: string, providerNames: string[]): void {
    this.routing[taskType] = providerNames;
  }

  /**
   * 获取所有Provider健康状态
   */
  async getAllProviderStatus(): Promise<ProviderStatus[]> {
    const results: ProviderStatus[] = [];
    for (const provider of this.providers.values()) {
      try {
        const status = await provider.healthCheck();
        results.push(status);
      } catch (err: any) {
        results.push({
          name: provider.name,
          displayName: provider.displayName,
          status: 'down',
          lastError: err.message,
        });
      }
    }
    return results;
  }

  /**
   * 根据provider名称和模型ID获取模型列表
   */
  async getModelsByProvider(providerName: string) {
    const provider = this.getProvider(providerName);
    if (provider.getModels) {
      return provider.getModels();
    }
    return [];
  }

  /**
   * 获取所有Provider的所有模型
   */
  async getAllModels(): Promise<Array<{ provider: string; providerName: string; models: any[] }>> {
    const result = [];
    for (const provider of this.providers.values()) {
      if (provider.getModels) {
        const models = await provider.getModels();
        result.push({
          provider: provider.name,
          providerName: provider.displayName,
          models,
        });
      }
    }
    return result;
  }
}
