/**
 * 豆包（字节跳动火山引擎）Provider
 * API文档：https://www.volcengine.com/docs/82379
 * 兼容OpenAI接口格式
 */
import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-provider';
import {
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ImageOptions,
  ImageResponse,
  ModelInfo,
  AIProviderError,
  AIErrorCode,
} from './ai-provider.interface';

@Injectable()
export class DoubaoProvider extends BaseAIProvider {
  readonly name = 'doubao';
  readonly displayName = '豆包（字节跳动）';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  /**
   * 豆包使用火山引擎API，兼容OpenAI格式
   * POST https://ark.cn-beijing.volces.com/api/v3/chat/completions
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
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
      top_p: options?.topP ?? 0.9,
    };

    if (options?.stop) {
      requestBody.stop = options.stop;
    }
    if (options?.frequencyPenalty !== undefined) {
      requestBody.frequency_penalty = options.frequencyPenalty;
    }
    if (options?.presencePenalty !== undefined) {
      requestBody.presence_penalty = options.presencePenalty;
    }

    // 流式处理
    if (options?.stream && options?.onStream) {
      requestBody.stream = true;
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

    return {
      content: data.choices[0].message?.content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      model: data.model || model,
      provider: this.name,
      durationMs: Date.now() - startTime,
      requestId: data.id,
    };
  }

  /**
   * 流式对话处理
   */
  private async handleStreamChat(
    requestBody: Record<string, any>,
    model: string,
    options: ChatOptions,
    startTime: number,
  ): Promise<ChatResponse> {
    const url = `${this.baseUrl}/chat/completions`;
    const bodyStr = JSON.stringify(requestBody);

    // 使用SSE流式获取
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const https = require('https');

      const reqOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
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
              const errData = JSON.parse(errorBody);
              reject(this.parseError(res.statusCode, errData));
            } catch {
              reject(new AIProviderError(
                `Stream request failed: ${res.statusCode}`,
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
              // 忽略解析错误的行
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
        id: 'doubao-pro-32k',
        name: '豆包 Pro 32K',
        capabilities: ['text', 'code'],
        maxContextLength: 32768,
        supportStream: true,
        inputPrice: 0.8,
        outputPrice: 2.0,
      },
      {
        id: 'doubao-pro-128k',
        name: '豆包 Pro 128K',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 1.0,
        outputPrice: 2.5,
      },
      {
        id: 'doubao-lite-32k',
        name: '豆包 Lite 32K',
        capabilities: ['text'],
        maxContextLength: 32768,
        supportStream: true,
        inputPrice: 0.3,
        outputPrice: 0.6,
      },
      {
        id: 'doubao-lite-128k',
        name: '豆包 Lite 128K',
        capabilities: ['text'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 0.5,
        outputPrice: 1.0,
      },
    ];
  }
}
