/**
 * AI Provider 基类
 * 提供通用的 HTTP 请求、重试、错误处理逻辑
 */
import { Logger } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import {
  IAIProvider,
  ChatResponse,
  ChatMessage,
  ChatOptions,
  ImageOptions,
  ImageResponse,
  ProviderStatus,
  ModelInfo,
  BalanceInfo,
  AIProviderError,
  AIErrorCode,
} from './ai-provider.interface';

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HttpResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
}

export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly name: string;
  abstract readonly displayName: string;
  abstract readonly capabilities: ('text' | 'image')[];

  protected logger: Logger;
  protected apiKey = '';
  protected baseUrl = '';
  protected defaultModel = '';
  protected maxRetries = 3;
  protected timeout = 60000;
  protected initialized = false;

  constructor() {
    this.logger = new Logger(`AIProvider:${this.constructor.name}`);
  }

  async init(config: Record<string, any>): Promise<void> {
    this.apiKey = config.apiKey || '';
    this.baseUrl = config.baseUrl || '';
    this.defaultModel = config.defaultModel || '';
    this.maxRetries = config.maxRetries ?? 3;
    this.timeout = config.timeout ?? 60000;
    this.initialized = true;
    this.logger.log(`Provider ${this.displayName} initialized with baseUrl: ${this.baseUrl}`);
  }

  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new AIProviderError(
        `Provider ${this.name} not initialized`,
        this.name,
        AIErrorCode.SERVICE_UNAVAILABLE,
      );
    }
    if (!this.apiKey) {
      throw new AIProviderError(
        `Provider ${this.name} API key not configured`,
        this.name,
        AIErrorCode.INVALID_API_KEY,
      );
    }
  }

  /**
   * 通用HTTP请求（使用Node原生模块，避免额外依赖）
   */
  protected async httpRequest(options: HttpRequestOptions): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(options.url);
      const isHttps = urlObj.protocol === 'https:';
      const transport = isHttps ? https : http;

      const bodyStr = options.body ? JSON.stringify(options.body) : undefined;

      const reqOptions: https.RequestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method,
        headers: {
          ...options.headers,
          ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr).toString() } : {}),
        },
        timeout: options.timeout || this.timeout,
      };

      const req = transport.request(reqOptions, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          let data: any;
          try {
            data = JSON.parse(rawBody);
          } catch {
            data = rawBody;
          }

          const responseHeaders: Record<string, string> = {};
          for (const [key, val] of Object.entries(res.headers)) {
            if (typeof val === 'string') responseHeaders[key] = val;
          }

          resolve({
            status: res.statusCode || 0,
            data,
            headers: responseHeaders,
          });
        });
      });

      req.on('error', (err) => {
        reject(new AIProviderError(
          `HTTP request failed: ${err.message}`,
          this.name,
          AIErrorCode.SERVICE_UNAVAILABLE,
          undefined,
          true,
        ));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new AIProviderError(
          `Request timeout after ${options.timeout || this.timeout}ms`,
          this.name,
          AIErrorCode.TIMEOUT,
          408,
          true,
        ));
      });

      if (bodyStr) {
        req.write(bodyStr);
      }
      req.end();
    });
  }

  /**
   * 带重试的请求
   */
  protected async requestWithRetry(
    fn: () => Promise<HttpResponse>,
    retries?: number,
  ): Promise<HttpResponse> {
    const maxRetry = retries ?? this.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetry; attempt++) {
      try {
        const response = await fn();

        // 处理HTTP级别错误
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers['retry-after'] || '5', 10);
          this.logger.warn(`Rate limited, waiting ${retryAfter}s before retry (attempt ${attempt + 1}/${maxRetry})`);
          if (attempt < maxRetry) {
            await this.sleep(retryAfter * 1000);
            continue;
          }
          throw new AIProviderError(
            'Rate limit exceeded',
            this.name,
            AIErrorCode.RATE_LIMITED,
            429,
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new AIProviderError(
            'Invalid API key or unauthorized',
            this.name,
            AIErrorCode.INVALID_API_KEY,
            response.status,
          );
        }

        if (response.status >= 500) {
          if (attempt < maxRetry) {
            this.logger.warn(`Server error ${response.status}, retrying (attempt ${attempt + 1}/${maxRetry})`);
            await this.sleep(1000 * Math.pow(2, attempt));
            continue;
          }
          throw new AIProviderError(
            `Server error: ${response.status}`,
            this.name,
            AIErrorCode.SERVICE_UNAVAILABLE,
            response.status,
          );
        }

        return response;
      } catch (err) {
        lastError = err as Error;
        if (err instanceof AIProviderError && !err.retryable) {
          throw err;
        }
        if (attempt < maxRetry) {
          const waitMs = 1000 * Math.pow(2, attempt);
          this.logger.warn(`Request failed, retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetry}): ${(err as Error).message}`);
          await this.sleep(waitMs);
        }
      }
    }

    throw lastError || new AIProviderError(
      'Request failed after all retries',
      this.name,
      AIErrorCode.UNKNOWN,
      undefined,
      true,
    );
  }

  /**
   * 解析provider通用错误
   */
  protected parseError(status: number, data: any): AIProviderError {
    const message = data?.error?.message || data?.message || data?.msg || 'Unknown error';

    if (status === 401 || status === 403) {
      return new AIProviderError(message, this.name, AIErrorCode.INVALID_API_KEY, status);
    }
    if (status === 429) {
      return new AIProviderError(message, this.name, AIErrorCode.RATE_LIMITED, status, true);
    }
    if (status === 400 && /content|filter|safety|policy/i.test(message)) {
      return new AIProviderError(message, this.name, AIErrorCode.CONTENT_FILTERED, status);
    }
    if (status >= 500) {
      return new AIProviderError(message, this.name, AIErrorCode.SERVICE_UNAVAILABLE, status, true);
    }
    return new AIProviderError(message, this.name, AIErrorCode.UNKNOWN, status);
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ===== 默认实现（子类按需覆盖） =====

  async generateImage(_prompt: string, _options?: ImageOptions): Promise<ImageResponse> {
    throw new AIProviderError(
      `${this.displayName} does not support image generation`,
      this.name,
      AIErrorCode.INVALID_PARAMS,
    );
  }

  async checkBalance(): Promise<BalanceInfo> {
    return { balance: -1, unit: 'unknown', sufficient: true };
  }

  async getModels(): Promise<ModelInfo[]> {
    return [];
  }

  async healthCheck(): Promise<ProviderStatus> {
    const start = Date.now();
    try {
      this.ensureInitialized();
      await this.chat([{ role: 'user', content: 'ping' }], { maxTokens: 5, model: this.defaultModel });
      return {
        name: this.name,
        displayName: this.displayName,
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    } catch (err: any) {
      return {
        name: this.name,
        displayName: this.displayName,
        status: 'degraded',
        latencyMs: Date.now() - start,
        lastError: err.message,
      };
    }
  }
}
