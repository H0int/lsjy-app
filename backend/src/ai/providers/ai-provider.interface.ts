/**
 * AI Provider 统一接口定义
 * 所有大模型服务商必须实现此接口
 */

// ===== 消息与选项 =====

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  /** 可选：图像URL（多模态场景） */
  imageUrl?: string;
}

export interface ChatOptions {
  /** 指定模型（不传则用provider默认模型） */
  model?: string;
  /** 温度参数 0-2 */
  temperature?: number;
  /** 最大输出token */
  maxTokens?: number;
  /** 是否流式响应 */
  stream?: boolean;
  /** top_p 核采样 */
  topP?: number;
  /** 频率惩罚 */
  frequencyPenalty?: number;
  /** 存在惩罚 */
  presencePenalty?: number;
  /** 停止词 */
  stop?: string[];
  /** 流式回调 */
  onStream?: (chunk: string) => void;
}

// ===== 响应结构 =====

export interface ChatResponse {
  /** 回复内容 */
  content: string;
  /** token用量 */
  usage: TokenUsage;
  /** 实际使用的模型 */
  model: string;
  /** 来源provider */
  provider: string;
  /** 请求耗时(毫秒) */
  durationMs: number;
  /** provider原始请求ID */
  requestId?: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ===== 图像生成 =====

export interface ImageOptions {
  /** 图片尺寸 如 '1024x1024' */
  size?: string;
  /** 风格 */
  style?: string;
  /** 生成数量 */
  count?: number;
  /** 质量 */
  quality?: 'standard' | 'hd';
  /** 参考图片URL（图生图） */
  refImage?: string;
}

export interface ImageResponse {
  /** 生成的图片URL列表 */
  urls: string[];
  /** 实际使用的模型 */
  model: string;
  /** 来源provider */
  provider: string;
  /** 请求耗时 */
  durationMs: number;
  /** 消耗的token/次数 */
  usage?: TokenUsage;
}


// ===== 视频生成 =====

export interface VideoOptions {
  /** 视频时长（秒） */
  duration?: number;
  /** 分辨率 如 '720p', '1080p' */
  resolution?: string;
  /** 视频风格 */
  style?: string;
  /** 渲染引擎 */
  engine?: string;
  /** 参考图片URL */
  refImage?: string;
}

export interface VideoResponse {
  /** 生成的视频URL */
  videoUrl: string;
  /** 视频封面图URL */
  thumbnailUrl?: string;
  /** 实际使用的模型 */
  model: string;
  /** 来源provider */
  provider: string;
  /** 请求耗时 */
  durationMs: number;
}

// ===== 余额与模型信息 =====

export interface BalanceInfo {
  /** 余额（具体单位由provider决定） */
  balance: number;
  /** 余额单位描述 */
  unit: string;
  /** 是否充足 */
  sufficient: boolean;
}

export interface ModelInfo {
  /** 模型ID */
  id: string;
  /** 模型显示名 */
  name: string;
  /** 能力类型 */
  capabilities: ('text' | 'image' | 'code' | 'multimodal')[];
  /** 最大上下文长度 */
  maxContextLength?: number;
  /** 是否支持流式 */
  supportStream?: boolean;
  /** 输入价格(圣力/千token) */
  inputPrice?: number;
  /** 输出价格(圣力/千token) */
  outputPrice?: number;
}

// ===== Provider状态 =====

export interface ProviderStatus {
  name: string;
  displayName: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs?: number;
  lastError?: string;
}

// ===== 核心接口 =====

export interface IAIProvider {
  /** Provider名称标识 */
  readonly name: string;
  /** 显示名称 */
  readonly displayName: string;
  /** 支持的类型 */
  readonly capabilities: ('text' | 'image' | 'video')[];

  /**
   * 文本对话
   * @param messages 消息列表
   * @param options 对话选项
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;

  /**
   * 图像生成（可选能力）
   * @param prompt 提示词
   * @param options 图像选项
   */
  generateImage?(prompt: string, options?: ImageOptions): Promise<ImageResponse>;

  /**
   * 视频生成（可选能力）
   * @param prompt 提示词
   * @param options 视频选项
   */
  generateVideo?(prompt: string, options?: VideoOptions): Promise<VideoResponse>;

  /**
   * 检查余额（可选）
   */
  checkBalance?(): Promise<BalanceInfo>;

  /**
   * 获取可用模型列表（可选）
   */
  getModels?(): Promise<ModelInfo[]>;

  /**
   * 健康检查
   */
  healthCheck(): Promise<ProviderStatus>;

  /**
   * 初始化Provider（用于延迟加载配置等）
   */
  init(config: Record<string, any>): Promise<void>;
}

// ===== 错误类型 =====

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code: AIErrorCode,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export enum AIErrorCode {
  /** API Key无效 */
  INVALID_API_KEY = 'INVALID_API_KEY',
  /** 余额不足 */
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  /** 速率限制 */
  RATE_LIMITED = 'RATE_LIMITED',
  /** 请求超时 */
  TIMEOUT = 'TIMEOUT',
  /** 模型不存在 */
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  /** 内容安全过滤 */
  CONTENT_FILTERED = 'CONTENT_FILTERED',
  /** 服务不可用 */
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  /** 参数错误 */
  INVALID_PARAMS = 'INVALID_PARAMS',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN',
}
