/**
 * Model Router Service - 统一模型调用层
 *
 * 职责：
 *  1. 按任务类型（simple/complex/code/vision/long_text）路由到真实可用模型；
 *  2. 主模型失败（超时/未开通/404/限流）时自动切换降级链中的备用模型；
 *  3. 记录降级事件（仅元数据：taskType/model/耗时/状态，不记录用户输入内容，满足日志脱敏）；
 *  4. 复用 AIProviderManager 中已注册的百炼 Provider（重试/超时/流式能力）。
 *
 * Base URL 与 API Key 全部来自环境变量，零硬编码：
 *  - DASHSCOPE_API_KEY（缺省回退 BAILIAN_API_KEY）
 *  - WORKSPACE_ID（可选；设置后使用 workspace 专属端点）
 */
import { Injectable, Logger } from '@nestjs/common';
import { AIProviderManager } from '../providers/provider-manager';
import {
  ChatMessage,
  ChatResponse,
  AIProviderError,
  AIErrorCode,
} from '../providers/ai-provider.interface';

/** 任务类型 */
export type TaskType = 'simple' | 'complex' | 'code' | 'vision' | 'long_text';

/** 模型路由配置项 */
export interface ModelRouteConfig {
  /** 文档显示名（对外展示） */
  displayName: string;
  /** 主模型（百炼真实模型ID） */
  primary: string;
  /** 降级链（百炼真实模型ID，按顺序尝试） */
  fallbacks: string[];
  /** 用途描述 */
  description: string;
}

/**
 * 任务路由表：任务类型 → 真实模型 + 降级链
 * 模型名映射到真实可用ID，文档名保留为显示名（已与业务确认）。
 */
export const MODEL_ROUTER: Record<TaskType, ModelRouteConfig> = {
  simple: {
    displayName: 'qwen3.7-plus',
    primary: 'qwen-plus',
    fallbacks: ['qwen-turbo'],
    description: '轻量问答 / 日常对话',
  },
  complex: {
    displayName: 'qwen3.7-max',
    primary: 'qwen-max',
    fallbacks: ['qwen-plus'],
    description: '复杂推理 / 专业任务',
  },
  code: {
    displayName: 'deepseek-v3.2-exp',
    primary: 'deepseek-v3',
    fallbacks: ['qwen-max', 'qwen-plus'],
    description: '代码生成 / 编程任务（未开通自动降级）',
  },
  vision: {
    displayName: 'qwen-vl-max',
    primary: 'qwen-vl-max',
    fallbacks: ['qwen-vl-plus'],
    description: '图片识别 / 多模态理解',
  },
  long_text: {
    displayName: 'kimi',
    primary: 'qwen-long',
    fallbacks: ['qwen-plus'],
    description: '长文本处理 / 大上下文',
  },
};

/** 降级事件（仅元数据，已脱敏，不含任何用户输入内容） */
export interface FallbackEvent {
  taskType: TaskType;
  fromModel: string;
  toModel: string;
  errorCode?: string;
  durationMs: number;
  timestamp: string;
}

/** Router 统一聊天选项 */
export interface RouterChatOptions {
  temperature?: number;
  maxTokens?: number;
  /** 显式指定模型（作为主模型，保留降级链） */
  model?: string;
  /** 流式回调（设置后启用流式） */
  onStream?: (chunk: string) => void;
}

/** Router 聊天结果（在 Provider 响应基础上附加路由元数据） */
export interface RouterChatResult extends ChatResponse {
  taskType: TaskType;
  /** 发生降级时被替换掉的主模型列表 */
  fallbackUsed: string[];
}

@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);

  /** 降级事件环形缓冲（最近100条，仅元数据） */
  private readonly fallbackEvents: FallbackEvent[] = [];
  private static readonly MAX_EVENTS = 100;

  constructor(private readonly providerManager: AIProviderManager) {}

  /**
   * 解析任务类型，非法值回退到 simple
   */
  resolveTaskType(taskType?: string): TaskType {
    if (taskType && Object.prototype.hasOwnProperty.call(MODEL_ROUTER, taskType)) {
      return taskType as TaskType;
    }
    return 'simple';
  }

  /**
   * 构建模型尝试链：显式 model 优先，否则用路由表主模型，后接降级链
   */
  private buildChain(taskType: TaskType, explicitModel?: string): string[] {
    const route = MODEL_ROUTER[taskType];
    const head = explicitModel && explicitModel.trim() ? explicitModel.trim() : route.primary;
    // 去重，避免显式 model 与降级链重复
    const chain = [head, ...route.fallbacks.filter((m) => m !== head)];
    return chain;
  }

  /**
   * 统一聊天入口（支持流式与非流式）
   * 主模型失败自动切降级模型；流式场景下若已向客户端输出内容则不再降级（避免内容重复）。
   */
  async chat(
    taskType: TaskType,
    messages: ChatMessage[],
    options?: RouterChatOptions,
  ): Promise<RouterChatResult> {
    const chain = this.buildChain(taskType, options?.model);
    const fallbackUsed: string[] = [];
    const stream = Boolean(options?.onStream);
    let emitted = false;
    let lastError: unknown = null;

    const onStream = options?.onStream
      ? (chunk: string) => {
          emitted = true;
          options.onStream!(chunk);
        }
      : undefined;

    for (let i = 0; i < chain.length; i++) {
      const model = chain[i];
      const start = Date.now();
      try {
        const provider = this.providerManager.getProvider('bailian');
        const result = await provider.chat(messages, {
          model,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
          stream,
          onStream,
        });
        return { ...result, taskType, fallbackUsed };
      } catch (err: unknown) {
        lastError = err;
        const durationMs = Date.now() - start;
        const errorCode = this.extractErrorCode(err);

        // 流式已输出内容则不降级，直接抛出（避免重复内容）
        if (emitted) {
          throw err;
        }

        if (i < chain.length - 1) {
          this.recordFallback({
            taskType,
            fromModel: model,
            toModel: chain[i + 1],
            errorCode,
            durationMs,
            timestamp: new Date().toISOString(),
          });
          fallbackUsed.push(model);
          // 仅记录元数据（taskType/model/耗时/状态），不记录用户输入内容
          this.logger.warn(
            `[ModelRouter] task=${taskType} model=${model} failed (${errorCode}), ` +
              `fallback to ${chain[i + 1]} after ${durationMs}ms`,
          );
        }
      }
    }

    if (lastError) {
      throw lastError;
    }
    throw new AIProviderError(
      'All models in the route failed',
      'bailian',
      AIErrorCode.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * 获取路由表与可用模型清单
   */
  async getRouterModels() {
    const routes = (Object.keys(MODEL_ROUTER) as TaskType[]).map((taskType) => {
      const cfg = MODEL_ROUTER[taskType];
      return {
        taskType,
        displayName: cfg.displayName,
        primary: cfg.primary,
        fallbacks: cfg.fallbacks,
        description: cfg.description,
      };
    });

    let providerActive = false;
    let providerModels: unknown[] = [];
    try {
      const provider = this.providerManager.getProvider('bailian');
      providerActive = true;
      if (provider.getModels) {
        providerModels = await provider.getModels();
      }
    } catch {
      providerActive = false;
    }

    return {
      provider: 'bailian',
      active: providerActive,
      routes,
      models: providerModels,
      recentFallbacks: this.fallbackEvents.slice(-20),
    };
  }

  /** 提取错误码（脱敏，仅状态/类型信息） */
  private extractErrorCode(err: unknown): string {
    if (err instanceof AIProviderError) {
      return err.code;
    }
    const anyErr = err as { code?: string; name?: string };
    return anyErr?.code || anyErr?.name || 'UNKNOWN';
  }

  /** 记录降级事件（环形缓冲，仅元数据） */
  private recordFallback(event: FallbackEvent): void {
    this.fallbackEvents.push(event);
    if (this.fallbackEvents.length > ModelRouterService.MAX_EVENTS) {
      this.fallbackEvents.shift();
    }
  }
}
