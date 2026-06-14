import { Injectable } from '@nestjs/common';
import { BaseAIProvider } from './base-provider';
import { ChatMessage, ChatOptions, ChatResponse, ModelInfo, AIProviderError, AIErrorCode } from './ai-provider.interface';

@Injectable()
export class YuanbaoProvider extends BaseAIProvider {
  readonly name = 'yuanbao';
  readonly displayName = '腾讯元宝';
  readonly capabilities: ('text' | 'image')[] = ['text'];

  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = options?.model || this.defaultModel;
    const body: Record<string, any> = {
      model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    };
    if (options?.stop) body.stop = options.stop;

    const response = await this.requestWithRetry(() =>
      this.httpRequest({
        method: 'POST',
        url: `${this.baseUrl}/chat/completions`,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body,
      }),
    );
    if (response.status !== 200) throw this.parseError(response.status, response.data);
    const data = response.data;
    if (!data.choices?.length) throw new AIProviderError('No choices', this.name, AIErrorCode.UNKNOWN);
    return {
      content: data.choices[0].message?.content || '',
      usage: { promptTokens: data.usage?.prompt_tokens || 0, completionTokens: data.usage?.completion_tokens || 0, totalTokens: data.usage?.total_tokens || 0 },
      model: data.model || model, provider: this.name, durationMs: Date.now() - startTime, requestId: data.id,
    };
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      { id: 'yuanbao-pro', name: '元宝 Pro', capabilities: ['text', 'code'], maxContextLength: 32768, supportStream: true, inputPrice: 0.8, outputPrice: 2.0 },
      { id: 'yuanbao-lite', name: '元宝 Lite', capabilities: ['text'], maxContextLength: 16384, supportStream: true, inputPrice: 0.3, outputPrice: 0.6 },
    ];
  }
}
