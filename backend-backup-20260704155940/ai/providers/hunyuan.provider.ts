/**
 * 腾讯云混元 Hunyuan Provider
 * 使用 TC3-HMAC-SHA256 签名认证
 * 支持 SecretId + SecretKey 方式调用
 */
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { BaseAIProvider } from './base-provider';
import {
  ChatMessage, ChatOptions, ChatResponse, ModelInfo, AIProviderError, AIErrorCode,
} from './ai-provider.interface';

@Injectable()
export class HunyuanProvider extends BaseAIProvider {
  readonly name = 'hunyuan';
  readonly displayName = '腾讯云混元';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  private secretId = '';
  private secretKey = '';

  async init(config: any): Promise<void> {
    await super.init(config);
    // Parse SecretId/SecretKey from apiKey config
    // Format: "SecretId=xxx,SecretKey=yyy" or just the apiKey contains both
    if (config.apiKey) {
      const sidMatch = config.apiKey.match(/SecretId=([^,]+)/);
      const skeyMatch = config.apiKey.match(/SecretKey=(.+)/);
      if (sidMatch && skeyMatch) {
        this.secretId = sidMatch[1];
        this.secretKey = skeyMatch[1];
      } else if (config.apiKey.includes(':')) {
        const parts = config.apiKey.split(':');
        this.secretId = parts[0];
        this.secretKey = parts[1];
      } else {
        // If it's a direct API key (sk- format), use bearer token fallback
        this.secretId = '';
        this.secretKey = '';
      }
    }
  }

  private sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private hmac256(key: Buffer | string, data: string): Buffer {
    return crypto.createHmac('sha256', key).update(data).digest();
  }

  private generateTC3Signature(timestamp: number, bodyStr: string): string {
    const service = 'hunyuan';
    const host = 'hunyuan.tencentcloudapi.com';
    const date = new Date(timestamp * 1000).toISOString().slice(0, 10); // YYYY-MM-DD

    // Step 1: Canonical request
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const contentType = 'application/json; charset=utf-8';
    const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-tc-action:chatcompletions\n`;
    const signedHeaders = 'content-type;host;x-tc-action';
    const hashedPayload = this.sha256(bodyStr);
    const canonicalRequest = [
      httpRequestMethod, canonicalUri, canonicalQueryString,
      canonicalHeaders, signedHeaders, hashedPayload
    ].join('\n');

    // Step 2: String to sign
    const algorithm = 'TC3-HMAC-SHA256';
    const credentialScope = `${date}/${service}/tc3_request`;
    const hashedCanonicalRequest = this.sha256(canonicalRequest);
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${hashedCanonicalRequest}`;

    // Step 3: Signing key
    const secretDate = this.hmac256(`TC3${this.secretKey}`, date);
    const secretService = this.hmac256(secretDate, service);
    const secretSigning = this.hmac256(secretService, 'tc3_request');

    // Step 4: Signature
    const signature = crypto.createHmac('sha256', secretSigning).update(stringToSign).digest('hex');

    // Authorization header
    return `${algorithm} Credential=${this.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;

    const formattedMessages = messages.map(m => ({ role: m.role, content: m.content }));
    const requestBody: Record<string, any> = {
      Model: model,
      Messages: formattedMessages,
      Temperature: options?.temperature ?? 0.7,
      TopP: options?.topP ?? 0.9,
    };
    if (options?.maxTokens) {
      requestBody.MaxTokens = options.maxTokens;
    }
    if (options?.stream && options?.onStream) {
      requestBody.Stream = true;
    }

    const bodyStr = JSON.stringify(requestBody);
    const timestamp = Math.floor(Date.now() / 1000);
    const isTC3 = this.secretId && this.secretKey;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (isTC3) {
      const authorization = this.generateTC3Signature(timestamp, bodyStr);
      headers['Authorization'] = authorization;
      headers['X-TC-Action'] = 'ChatCompletions';
      headers['X-TC-Version'] = '2023-09-01';
      headers['X-TC-Region'] = 'ap-guangzhou';
      headers['X-TC-Timestamp'] = timestamp.toString();
    } else {
      // Bearer token fallback (if user has an sk- format key)
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (options?.stream && options?.onStream) {
      return this.handleStreamChat(bodyStr, headers, model, options, startTime);
    }

    const response = await this.requestWithRetry(() =>
      this.httpRequest({
        method: 'POST',
        url: 'https://hunyuan.tencentcloudapi.com/',
        headers,
        body: requestBody,
      }),
    );

    if (response.status !== 200) throw this.parseError(response.status, response.data);
    const data = response.data;

    // TC3 response wraps in Response key
    const resp = data.Response || data;
    if (resp.Error) {
      throw new AIProviderError(resp.Error.Message, this.name, AIErrorCode.UNKNOWN, resp.Error.Code as any);
    }

    const choices = resp.Choices || resp.choices || [];
    if (!choices.length) throw new AIProviderError('No choices in response', this.name, AIErrorCode.UNKNOWN);

    const content = choices[0]?.Message?.Content || choices[0]?.message?.content || '';
    const usage = resp.Usage || resp.usage || {};

    return {
      content,
      usage: {
        promptTokens: usage.PromptTokens || usage.prompt_tokens || 0,
        completionTokens: usage.CompletionTokens || usage.completion_tokens || 0,
        totalTokens: usage.TotalTokens || usage.total_tokens || 0,
      },
      model: resp.Model || model,
      provider: this.name,
      durationMs: Date.now() - startTime,
      requestId: resp.RequestId || resp.id,
    };
  }

  private async handleStreamChat(
    bodyStr: string, headers: Record<string, string>, model: string, options: ChatOptions, startTime: number,
  ): Promise<ChatResponse> {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const reqOptions = {
        hostname: 'hunyuan.tencentcloudapi.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: { ...headers, 'Content-Length': Buffer.byteLength(bodyStr) },
        timeout: this.timeout,
      };

      let fullContent = '', totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
      const req = https.request(reqOptions, (res: any) => {
        if (res.statusCode !== 200) {
          let e = '';
          res.on('data', (c: Buffer) => e += c.toString());
          res.on('end', () => {
            try { reject(this.parseError(res.statusCode, JSON.parse(e))); }
            catch { reject(new AIProviderError(`Stream error: ${res.statusCode}`, this.name, AIErrorCode.UNKNOWN, res.statusCode)); }
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
            const t = line.trim();
            if (!t || !t.startsWith('data:')) continue;
            const j = t.slice(5).trim();
            if (j === '[DONE]') continue;
            try {
              const p = JSON.parse(j);
              const resp = p.Response || p;
              const choices = resp.Choices || resp.choices || [];
              const delta = choices[0]?.Delta?.Content || choices[0]?.delta?.content || '';
              if (delta) { fullContent += delta; options.onStream?.(delta); }
              if (resp.Usage) {
                totalUsage = {
                  promptTokens: resp.Usage.PromptTokens || resp.Usage.prompt_tokens || 0,
                  completionTokens: resp.Usage.CompletionTokens || resp.Usage.completion_tokens || 0,
                  totalTokens: resp.Usage.TotalTokens || resp.Usage.total_tokens || 0,
                };
              }
            } catch {}
          }
        });
        res.on('end', () => resolve({ content: fullContent, usage: totalUsage, model, provider: this.name, durationMs: Date.now() - startTime }));
        res.on('error', (err: Error) => reject(new AIProviderError(`Stream error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      });
      req.on('error', (err: Error) => reject(new AIProviderError(`Request error: ${err.message}`, this.name, AIErrorCode.SERVICE_UNAVAILABLE, undefined, true)));
      req.write(bodyStr);
      req.end();
    });
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'hunyuan-lite', name: '混元 Lite (免费)', capabilities: ['text'], maxContextLength: 256000, supportStream: true, inputPrice: 0, outputPrice: 0 },
      { id: 'hunyuan-turbos-latest', name: '混元 Turbos', capabilities: ['text', 'code'], maxContextLength: 256000, supportStream: true },
      { id: 'hunyuan-turbos-longtext', name: '混元 Turbos 长文本', capabilities: ['text'], maxContextLength: 256000, supportStream: true },
      { id: 'hunyuan-vision', name: '混元 Vision (多模态)', capabilities: ['text', 'multimodal'], maxContextLength: 8192, supportStream: true },
      { id: 'hy3-preview', name: '混元3 Preview', capabilities: ['text', 'code'], maxContextLength: 256000, supportStream: true },
    ];
  }
}
