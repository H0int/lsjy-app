/**
 * OpenAI GPT Provider
 * 官网：https://platform.openai.com
 * 支持GPT-4/3.5文本生成 + DALL-E图像生成
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
export class OpenAIProvider extends BaseAIProvider {
  readonly name: string = 'openai';
  readonly displayName: string = 'OpenAI GPT';
  readonly capabilities: ('text' | 'image')[] = ['text', 'image'];

  /**
   * 文本对话（GPT-4 / GPT-3.5）
   * POST https://api.openai.com/v1/chat/completions
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    // 构造消息体（支持多模态输入）
    const formattedMessages = messages.map((m) => {
      if (m.imageUrl && (m.role === 'user')) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.imageUrl, detail: 'auto' } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const requestBody: Record<string, any> = {
      model,
      messages: formattedMessages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      top_p: options?.topP ?? 1.0,
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

    const choice = data.choices[0];
    if (choice.finish_reason === 'content_filter') {
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
      requestId: data.id,
    };
  }

  /**
   * 流式对话处理（SSE）
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

  /**
   * DALL-E 图像生成
   * POST https://api.openai.com/v1/images/generations
   */
  async generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = 'dall-e-3';

    const requestBody: Record<string, any> = {
      model,
      prompt,
      n: options?.count || 1,
      size: options?.size || '1024x1024',
      quality: options?.quality || 'standard',
      response_format: 'url',
    };

    // DALL-E 3 只支持 n=1
    if (model === 'dall-e-3') {
      requestBody.n = 1;
    }

    const response = await this.requestWithRetry(() =>
      this.httpRequest({
        method: 'POST',
        url: `${this.baseUrl}/images/generations`,
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
    const urls: string[] = [];

    if (data.data && Array.isArray(data.data)) {
      for (const item of data.data) {
        if (item.url) urls.push(item.url);
        else if (item.b64_json) urls.push(`data:image/png;base64,${item.b64_json}`);
      }
    }

    if (urls.length === 0) {
      throw new AIProviderError(
        'No images generated',
        this.name,
        AIErrorCode.UNKNOWN,
      );
    }

    return {
      urls,
      model,
      provider: this.name,
      durationMs: Date.now() - startTime,
    };
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        capabilities: ['text', 'code', 'multimodal'],
        maxContextLength: 8192,
        supportStream: true,
        inputPrice: 20,
        outputPrice: 60,
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        capabilities: ['text', 'code', 'multimodal'],
        maxContextLength: 128000,
        supportStream: true,
        inputPrice: 10,
        outputPrice: 30,
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        capabilities: ['text', 'code', 'multimodal'],
        maxContextLength: 128000,
        supportStream: true,
        inputPrice: 5,
        outputPrice: 15,
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        capabilities: ['text', 'code'],
        maxContextLength: 16385,
        supportStream: true,
        inputPrice: 0.5,
        outputPrice: 1.5,
      },
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        capabilities: ['image'],
        supportStream: false,
        inputPrice: 0,
        outputPrice: 40, // 按次计费
      },
    ];
  }
}
