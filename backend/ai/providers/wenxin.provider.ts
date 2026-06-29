/**
 * 百度文心 Wenxin Provider (千帆平台 OpenAI 兼容模式)
 * 官网：https://qianfan.baidubce.com
 * OpenAI 兼容 API，使用 IAM v3 签名 API Key 作为 Bearer token
 */
import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-provider';
import {
  ChatMessage, ChatOptions, ChatResponse, ModelInfo, AIProviderError, AIErrorCode,
} from './ai-provider.interface';

@Injectable()
export class WenxinProvider extends BaseAIProvider {
  readonly name = 'wenxin';
  readonly displayName = '百度文心';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const formattedMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const requestBody: Record<string, any> = {
      model, messages: formattedMessages,
      temperature: options?.temperature ?? 0.7, max_tokens: options?.maxTokens ?? 4096, top_p: options?.topP ?? 0.9,
    };

    if (options?.stream && options?.onStream) {
      requestBody.stream = true;
      return this.handleStreamChat(requestBody, model, options, startTime);
    }

    const response = await this.requestWithRetry(() =>
      this.httpRequest({ method: 'POST', url: `${this.baseUrl}/chat/completions`, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` }, body: requestBody }),
    );

    if (response.status !== 200) throw this.parseError(response.status, response.data);
    const data = response.data;
    if (!data.choices?.length) throw new AIProviderError('No choices in response', this.name, AIErrorCode.UNKNOWN);

    return {
      content: data.choices[0].message?.content || '',
      usage: { promptTokens: data.usage?.prompt_tokens || 0, completionTokens: data.usage?.completion_tokens || 0, totalTokens: data.usage?.total_tokens || 0 },
      model: data.model || model, provider: this.name, durationMs: Date.now() - startTime, requestId: data.id,
    };
  }

  private async handleStreamChat(requestBody: Record<string, any>, model: string, options: ChatOptions, startTime: number): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(`${this.baseUrl}/chat/completions`);
      const bodyStr = JSON.stringify(requestBody);
      const https = require('https');
      const reqOptions = { hostname: urlObj.hostname, port: 443, path: urlObj.pathname, method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}`, 'Content-Length': Buffer.byteLength(bodyStr) }, timeout: this.timeout };
      let fullContent = '', totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const req = https.request(reqOptions, (res: any) => {
        if (res.statusCode !== 200) { let e = ''; res.on('data', (c: Buffer) => e += c.toString()); res.on('end', () => { try { reject(this.parseError(res.statusCode, JSON.parse(e))); } catch { reject(new AIProviderError(`Stream error: ${res.statusCode}`, this.name, AIErrorCode.UNKNOWN, res.statusCode)); } }); return; }
        let buffer = ''; res.setEncoding('utf-8');
        res.on('data', (chunk: string) => { buffer += chunk; const lines = buffer.split('\n'); buffer = lines.pop() || ''; for (const line of lines) { const t = line.trim(); if (!t || !t.startsWith('data: ')) continue; const j = t.slice(6); if (j === '[DONE]') continue; try { const p = JSON.parse(j); const d = p.choices?.[0]?.delta?.content || ''; if (d) { fullContent += d; options.onStream?.(d); } if (p.usage) totalUsage = { promptTokens: p.usage.prompt_tokens || 0, completionTokens: p.usage.completion_tokens || 0, totalTokens: p.usage.total_tokens || 0 }; } catch {} } });
        res.on('end', () => resolve({ content: fullContent, usage: totalUsage, model, provider: this.name, durationMs: Date.now() - startTime }));
        res.on('error', (err: Error) => reject(new AIProviderError(`Stream error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      });
      req.on('error', (err: Error) => reject(new AIProviderError(`Request error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      req.write(bodyStr); req.end();
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'ernie-speed-128k', name: 'ERNIE Speed 128K (免费)', capabilities: ['text'], maxContextLength: 128000, supportStream: true, inputPrice: 0, outputPrice: 0 },
      { id: 'ernie-lite-8k', name: 'ERNIE Lite 8K (免费)', capabilities: ['text'], maxContextLength: 8192, supportStream: true, inputPrice: 0, outputPrice: 0 },
      { id: 'ernie-4.0-8k', name: 'ERNIE 4.0 8K', capabilities: ['text', 'code'], maxContextLength: 8192, supportStream: true },
      { id: 'ernie-3.5-8k', name: 'ERNIE 3.5 8K', capabilities: ['text'], maxContextLength: 8192, supportStream: true },
      { id: 'ernie-5.0', name: 'ERNIE 5.0', capabilities: ['text', 'code'], maxContextLength: 128000, supportStream: true },
    ];
  }
}
