/**
 * AI Provider 管理器
 * 负责注册、发现、路由、负载均衡
 * 支持 15 个 AI 服务商：硅基流动、DeepSeek、Kimi、豆包(火山方舟)、火山引擎、
 * 智谱、阿里云百练、魔搭社区、讯飞星火、腾讯云混元、百度文心、龙虾AI、
 * 即梦、OpenAI、通义、元宝
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIProvider, ProviderStatus, AIProviderError, AIErrorCode } from './ai-provider.interface';
import { DoubaoProvider } from './doubao.provider';
import { DeepSeekProvider } from './deepseek.provider';
import { JimengProvider } from './jimeng.provider';
import { OpenAIProvider } from './openai.provider';
import { TongyiProvider } from './tongyi.provider';
import { YuanbaoProvider } from './yuanbao.provider';
import { SiliconFlowProvider } from './siliconflow.provider';
import { KimiProvider } from './kimi.provider';
import { ZhipuProvider } from './zhipu.provider';
import { BailianProvider } from './bailian.provider';
import { ModelScopeProvider } from './modelscope.provider';
import { SparkProvider } from './spark.provider';
import { HunyuanProvider } from './hunyuan.provider';
import { WenxinProvider } from './wenxin.provider';
import { LongxiaProvider } from './longxia.provider';
import { VolcengineProvider } from './volcengine.provider';

/** 任务类型 → Provider优先级映射 */
const DEFAULT_ROUTING: Record<string, string[]> = {
  'text-generation': [
    'doubao', 'volcengine', 'deepseek', 'siliconflow', 'kimi', 'zhipu', 'bailian',
    'modelscope', 'spark', 'hunyuan', 'wenxin', 'longxia',
    'openai', 'tongyi', 'yuanbao'
  ],
  'image-generation': ['jimeng', 'openai'],
  'code-generation': [
    'deepseek', 'siliconflow', 'kimi', 'zhipu', 'bailian',
    'modelscope', 'volcengine', 'doubao', 'longxia',
    'openai', 'tongyi'
  ],
  'text-analysis': [
    'tongyi', 'doubao', 'deepseek', 'siliconflow', 'kimi', 'zhipu',
    'bailian', 'modelscope', 'spark', 'hunyuan', 'wenxin', 'longxia',
    'openai', 'yuanbao'
  ],
  'multimodal': ['openai', 'bailian', 'zhipu', 'volcengine'],
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
      // ===== 已有 Provider =====
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
        instance: new DeepSeekProvider(),
        apiKey: this.configService.get<string>('DEEPSEEK_API_KEY'),
        baseUrl: this.configService.get<string>('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
        defaultModel: this.configService.get<string>('DEEPSEEK_MODEL', 'deepseek-chat'),
      },
      {
        instance: new YuanbaoProvider(),
        apiKey: this.configService.get<string>('YUANBAO_API_KEY'),
        baseUrl: this.configService.get<string>('YUANBAO_BASE_URL', 'https://api.yuanbao.tencent.com/v1'),
        defaultModel: this.configService.get<string>('YUANBAO_MODEL', 'yuanbao-pro'),
      },
      {
        instance: new SiliconFlowProvider(),
        apiKey: this.configService.get<string>('SILICONFLOW_API_KEY'),
        baseUrl: this.configService.get<string>('SILICONFLOW_BASE_URL', 'https://api.siliconflow.cn/v1'),
        defaultModel: this.configService.get<string>('SILICONFLOW_MODEL', 'deepseek-ai/DeepSeek-V3'),
      },
      {
        instance: new KimiProvider(),
        apiKey: this.configService.get<string>('KIMI_API_KEY'),
        baseUrl: this.configService.get<string>('KIMI_BASE_URL', 'https://api.moonshot.cn/v1'),
        defaultModel: this.configService.get<string>('KIMI_MODEL', 'moonshot-v1-8k'),
      },

      // ===== 新增 Provider =====
      {
        instance: new ZhipuProvider(),
        apiKey: this.configService.get<string>('ZHIPU_API_KEY'),
        baseUrl: this.configService.get<string>('ZHIPU_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4'),
        defaultModel: this.configService.get<string>('ZHIPU_MODEL', 'GLM-4-Flash'),
      },
      {
        instance: new BailianProvider(),
        apiKey: this.configService.get<string>('BAILIAN_API_KEY'),
        baseUrl: this.configService.get<string>('BAILIAN_BASE_URL', 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
        defaultModel: this.configService.get<string>('BAILIAN_MODEL', 'qwen-plus'),
      },
      {
        instance: new ModelScopeProvider(),
        apiKey: this.configService.get<string>('MODELSCOPE_API_KEY'),
        baseUrl: this.configService.get<string>('MODELSCOPE_BASE_URL', 'https://api-inference.modelscope.cn/v1'),
        defaultModel: this.configService.get<string>('MODELSCOPE_MODEL', 'Qwen/Qwen3-235B-A22B-Instruct'),
      },
      {
        instance: new SparkProvider(),
        apiKey: this.configService.get<string>('SPARK_API_KEY'),
        baseUrl: this.configService.get<string>('SPARK_BASE_URL', 'https://spark-api-open.xf-yun.com/v1'),
        defaultModel: this.configService.get<string>('SPARK_MODEL', 'generalv3.5'),
      },
      {
        instance: new HunyuanProvider(),
        // 腾讯混元使用 TC3-HMAC-SHA256 签名认证，apiKey 格式: "SecretId=xxx,SecretKey=yyy"
        // 如果后续获取到 sk- 格式的 API Key，替换此处即可自动切换为 Bearer token 模式
        apiKey: this.configService.get<string>('HUNYUAN_API_KEY'),
        baseUrl: this.configService.get<string>('HUNYUAN_BASE_URL', 'https://hunyuan.tencentcloudapi.com'),
        defaultModel: this.configService.get<string>('HUNYUAN_MODEL', 'hunyuan-lite'),
      },
      {
        instance: new WenxinProvider(),
        apiKey: this.configService.get<string>('WENXIN_API_KEY'),
        baseUrl: this.configService.get<string>('WENXIN_BASE_URL', 'https://qianfan.baidubce.com/v2'),
        defaultModel: this.configService.get<string>('WENXIN_MODEL', 'ernie-speed-128k'),
      },
      {
        instance: new LongxiaProvider(),
        apiKey: this.configService.get<string>('LONGXIA_API_KEY'),
        baseUrl: this.configService.get<string>('LONGXIA_BASE_URL', 'https://api.longcat.chat/openai'),
        defaultModel: this.configService.get<string>('LONGXIA_MODEL', 'LongCat-Flash-Chat'),
      },
      {
        instance: new VolcengineProvider(),
        apiKey: this.configService.get<string>('VOLCENGINE_API_KEY'),
        baseUrl: this.configService.get<string>('VOLCENGINE_BASE_URL', 'https://ark.cn-beijing.volces.com/api/v3'),
        defaultModel: this.configService.get<string>('VOLCENGINE_MODEL', 'doubao-seed-2-1-pro-260628'),
      },
    ];

    for (const cfg of providerConfigs) {
      try {
        if (!cfg.apiKey) {
          this.logger.warn(`Provider ${cfg.instance.displayName} skipped: API key not configured`);
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
