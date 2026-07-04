/**
 * 火山引擎（字节跳动）Provider
 * 使用火山引擎 Ark API，兼容 OpenAI 格式
 * 用于与豆包(doubao)不同的 API Key
 */
import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-provider';
import {
  ChatMessage, ChatOptions, ChatResponse, ModelInfo, AIProviderError, AIErrorCode,
} from './ai-provider.interface';

@Injectable()
export class VolcengineProvider extends BaseAIProvider {
  readonly name = 'volcengine';
  readonly displayName = '火山引擎';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const requestBody: Record<string, any> = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
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

    if (response.status !== 200) throw this.parseError(response.status, response.data);
    const data = response.data;
    if (!data.choices?.length) throw new AIProviderError('No choices in response', this.name, AIErrorCode.UNKNOWN);

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

  private async handleStreamChat(requestBody: Record<string, any>, model: string, options: ChatOptions, startTime: number): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(`${this.baseUrl}/chat/completions`);
      const bodyStr = JSON.stringify(requestBody);
      const https = require('https');
      const reqOptions = {
        hostname: urlObj.hostname, port: 443, path: urlObj.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}`, 'Content-Length': Buffer.byteLength(bodyStr) },
        timeout: this.timeout,
      };
      let fullContent = '', totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const req = https.request(reqOptions, (res: any) => {
        if (res.statusCode !== 200) {
          let e = ''; res.on('data', (c: Buffer) => e += c.toString());
          res.on('end', () => { try { reject(this.parseError(res.statusCode, JSON.parse(e))); } catch { reject(new AIProviderError(`Stream: ${res.statusCode}`, this.name, AIErrorCode.UNKNOWN, res.statusCode)); } });
          return;
        }
        let buffer = ''; res.setEncoding('utf-8');
        res.on('data', (chunk: string) => {
          buffer += chunk;
          const lines = buffer.split('\n'); buffer = lines.pop() || '';
          for (const line of lines) {
            const t = line.trim();
            if (!t || !t.startsWith('data: ')) continue;
            const j = t.slice(6); if (j === '[DONE]') continue;
            try {
              const p = JSON.parse(j);
              const d = p.choices?.[0]?.delta?.content || '';
              if (d) { fullContent += d; options.onStream?.(d); }
              if (p.usage) totalUsage = { promptTokens: p.usage.prompt_tokens || 0, completionTokens: p.usage.completion_tokens || 0, totalTokens: p.usage.total_tokens || 0 };
            } catch {}
          }
        });
        res.on('end', () => resolve({ content: fullContent, usage: totalUsage, model, provider: this.name, durationMs: Date.now() - startTime }));
        res.on('error', (err: Error) => reject(new AIProviderError(`Stream error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      });
      req.on('error', (err: Error) => reject(new AIProviderError(`Request error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      req.write(bodyStr); req.end();
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'doubao-seed-2-1-pro-260628', name: 'Doubao Seed 2.1 Pro', capabilities: ['text', 'code'], maxContextLength: 256000, supportStream: true },
      { id: 'doubao-pro-32k', name: '豆包 Pro 32K', capabilities: ['text', 'code'], maxContextLength: 32768, supportStream: true },
      { id: 'doubao-pro-128k', name: '豆包 Pro 128K', capabilities: ['text', 'code'], maxContextLength: 131072, supportStream: true },
      { id: 'doubao-lite-32k', name: '豆包 Lite 32K', capabilities: ['text'], maxContextLength: 32768, supportStream: true },
      { id: 'deepseek-v3', name: 'DeepSeek V3 (火山)', capabilities: ['text', 'code'], maxContextLength: 64000, supportStream: true },
    ];
  }
}
