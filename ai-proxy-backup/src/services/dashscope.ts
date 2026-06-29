import fetch from 'node-fetch';
import { ProviderConfig } from '../types';

/**
 * 阿里云百炼 DashScope 服务
 * OpenAI 兼容格式
 */
export class DashscopeService {
  constructor(private config: ProviderConfig) {}

  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<any> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DashScope API error ${response.status}: ${errorText}`);
    }

    return response.json();
  }

  async chatStream(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<NodeJS.ReadableStream> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DashScope API error ${response.status}: ${errorText}`);
    }

    return response.body as NodeJS.ReadableStream;
  }
}
