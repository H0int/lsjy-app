/**
 * 硅基流动 SiliconFlow Provider
 * 官网：https://siliconflow.cn
 * OpenAI 兼容 API，支持多种开源大模型
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
export class SiliconFlowProvider extends BaseAIProvider {
  readonly name = 'siliconflow';
  readonly displayName = '硅基流动';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  /**
   * 文本对话
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const requestBody: Record<string, any> = {
      model,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      top_p: options?.topP ?? 0.9,
    };

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
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3',
        capabilities: ['text', 'code'],
        maxContextLength: 65536,
        supportStream: true,
        inputPrice: 0.14,
        outputPrice: 0.28,
      },
      {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1',
        capabilities: ['text', 'code', 'reasoning'],
        maxContextLength: 65536,
        supportStream: true,
        inputPrice: 0.55,
        outputPrice: 2.19,
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: '通义千问2.5 72B',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 0.18,
        outputPrice: 0.18,
      },
      {
        id: 'Qwen/Qwen2.5-7B-Instruct',
        name: '通义千问2.5 7B',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 0.03,
        outputPrice: 0.03,
      },
      {
        id: 'meta-llama/Llama-3.1-405B-Instruct',
        name: 'Llama 3.1 405B',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 2.7,
        outputPrice: 2.7,
      },
      {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B',
        capabilities: ['text', 'code'],
        maxContextLength: 131072,
        supportStream: true,
        inputPrice: 0.06,
        outputPrice: 0.06,
      },
    ];
  }
}
