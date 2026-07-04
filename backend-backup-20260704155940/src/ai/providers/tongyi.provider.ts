/**
 * 通义千问 Provider（龙虾AI使用此接口）
 * 参考：https://tongyi.aliyun.com
 * API文档：https://help.aliyun.com/zh/dashscope/
 * 兼容OpenAI接口格式（DashScope OpenAI兼容模式）
 */
import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-provider';
import {
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ModelInfo,
  AIProviderError,
  AIErrorCode,
} from './ai-provider.interface';

@Injectable()
export class TongyiProvider extends BaseAIProvider {
  readonly name = 'tongyi';
  readonly displayName = '通义千问';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  /**
   * 文本对话
   * DashScope兼容OpenAI格式：POST /chat/completions
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const requestBody: Record<string, any> = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature: options?.temperature ?? 0.85,
      max_tokens: options?.maxTokens ?? 2048,
      top_p: options?.topP ?? 0.8,
    };

    if (options?.stop) {
      requestBody.stop = options.stop;
    }

    // 流式处理
    if (options?.stream && options?.onStream) {
      requestBody.stream = true;
      requestBody.incremental_output = true;
      return this.handleStreamChat(requestBody, model, options, startTime);
    }

    const response = await this.requestWithRetry(() =>
      this.httpRequest({
        method: 'POST',
        url: `${this.baseUrl}/chat/completions`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: requestBody,
      }),
    );

    if (response.status !== 200) {
      throw this.parseError(response.status, response.data);
    }

    const data = response.data;
    if (!data.choices || data.choices.length === 0) {
      throw new AIProviderError(
        'No choices in response',
        this.name,
        AIErrorCode.UNKNOWN,
      );
    }

    const choice = data.choices[0];
    const finishReason = choice.finish_reason;

    if (finishReason === 'content_filter') {
      throw new AIProviderError(
        'Content filtered by safety system',
        this.name,
        AIErrorCode.CONTENT_FILTERED,
      );
    }

    return {
      content: choice.message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model || model,
      provider: this.name,
      durationMs: Date.now() - startTime,
      requestId: data.id || data.request_id,
    };
  }

  /**
   * 流式对话处理（DashScope SSE格式）
   */
  private async handleStreamChat(
    requestBody: Record<string, any>,
    model: string,
    options: ChatOptions,
    startTime: number,
  ): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}/chat/completions`;
      const urlObj = new URL(url);
      const bodyStr = JSON.stringify(requestBody);
      const https = require('https');

      const reqOptions = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(bodyStr),
        },
        timeout: this.timeout,
      };

      let fullContent = '';
      let totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

      const req = https.request(reqOptions, (res: any) => {
        if (res.statusCode !== 200) {
          let errorBody = '';
          res.on('data', (chunk: Buffer) => (errorBody += chunk.toString()));
          res.on('end', () => {
            try {
              reject(this.parseError(res.statusCode, JSON.parse(errorBody)));
            } catch {
              reject(new AIProviderError(
                `Stream error: ${res.statusCode}`,
                this.name,
                AIErrorCode.UNKNOWN,
                res.statusCode,
              ));
            }
          });
          return;
        }

        let buffer = '';
        res.setEncoding('utf-8');

        res.on('data', (chunk: string) => {
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                fullContent += delta;
                options.onStream?.(delta);
              }
              if (parsed.usage) {
                totalUsage = {
                  promptTokens: parsed.usage.prompt_tokens || 0,
                  completionTokens: parsed.usage.completion_tokens || 0,
                  totalTokens: parsed.usage.total_tokens || 0,
                };
              }
            } catch {
              // skip
            }
          }
        });

        res.on('end', () => {
          resolve({
            content: fullContent,
            usage: totalUsage,
            model,
            provider: this.name,
            durationMs: Date.now() - startTime,
          });
        });

        res.on('error', (err: Error) => {
          reject(new AIProviderError(
            `Stream error: ${err.message}`,
            this.name,
            AIErrorCode.SERVICE_UNAVAILABLE,
            undefined,
            true,
          ));
        });
      });

      req.on('error', (err: Error) => {
        reject(new AIProviderError(
          `Request error: ${err.message}`,
          this.name,
          AIErrorCode.SERVICE_UNAVAILABLE,
          undefined,
          true,
        ));
      });

      req.write(bodyStr);
      req.end();
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'qwen-turbo',
        name: '通义千问 Turbo',
        capabilities: ['text', 'code'],
        maxContextLength: 8192,
        supportStream: true,
        inputPrice: 0.3,
        outputPrice: 0.6,
      },
      {
        id: 'qwen-plus',
        name: '通义千问 Plus',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 0.8,
        outputPrice: 2.0,
      },
      {
        id: 'qwen-max',
        name: '通义千问 Max',
        capabilities: ['text', 'code'],
        maxContextLength: 32768,
        supportStream: true,
        inputPrice: 2.0,
        outputPrice: 6.0,
      },
      {
        id: 'qwen-long',
        name: '通义千问 Long',
        capabilities: ['text'],
        maxContextLength: 10000000,
        supportStream: true,
        inputPrice: 0.5,
        outputPrice: 2.0,
      },
    ];
  }
}
