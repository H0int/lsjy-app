import fetch from 'node-fetch';
import { ProviderConfig } from '../types';

/**
 * 智谱 AI 服务
 * OpenAI 兼容格式（/chat/completions）
 */
export class ZhipuService {
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
      throw new Error(`Zhipu API error ${response.status}: ${errorText}`);
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
      throw new Error(`Zhipu API error ${response.status}: ${errorText}`);
    }

    return response.body as NodeJS.ReadableStream;
  }

  /**
   * 图片生成 - CogView
   */
  async generateImage(
    prompt: string,
    model: string = 'cogview-4',
    size: string = '1024x1024'
  ): Promise<{ url: string }> {
    const response = await fetch(`${this.config.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size,
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zhipu Image API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as any;
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('图片生成失败：未返回图片 URL');
    }

    return { url: imageUrl };
  }
}
