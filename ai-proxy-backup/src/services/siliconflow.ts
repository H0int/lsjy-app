import fetch from 'node-fetch';
import { ProviderConfig } from '../types';

/**
 * 硅基流动 SiliconFlow 服务
 * OpenAI 兼容格式
 */
export class SiliconFlowService {
  constructor(private config: ProviderConfig) {}

  /**
   * 非流式对话
   */
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
      signal: AbortSignal.timeout(120000) as any,
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
      throw new Error(`SiliconFlow API error ${response.status}: ${errorText}`);
    }

    // Collect SSE stream and combine into single response
    const body = response.body as NodeJS.ReadableStream;
    let fullContent = '';
    let fullReasoningContent = '';
    let lastChunk: any = null;
    const id = `chatcmpl-${Date.now()}`;
    const created = Math.floor(Date.now() / 1000);
    let buffer = '';

    return new Promise((resolve, reject) => {
      body.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) fullContent += delta.content;
            if (delta?.reasoning_content) fullReasoningContent += delta.reasoning_content;
            lastChunk = parsed;
          } catch {}
        }
      });
      
      body.on('end', () => {
        resolve({
          id,
          object: 'chat.completion',
          created,
          model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: fullContent || fullReasoningContent || '',
            },
            finish_reason: lastChunk?.choices?.[0]?.finish_reason || 'stop',
          }],
        });
      });
      
      body.on('error', reject);
    });
  }

  /**
   * 流式对话 - 返回 Response 以便转发 SSE
   */
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
      throw new Error(`SiliconFlow API error ${response.status}: ${errorText}`);
    }

    return response.body as NodeJS.ReadableStream;
  }

  /**
   * 图片生成
   */
  async generateImage(
    prompt: string,
    model: string,
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
      throw new Error(`SiliconFlow Image API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as any;
    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('图片生成失败：未返回图片 URL');
    }

    return { url: imageUrl };
  }
}
