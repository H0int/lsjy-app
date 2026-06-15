/**
 * 即梦（字节跳动AI绘画）Provider
 * 官网：https://www.volcengine.com/product/jimeng
 * 支持文生图、图生图
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
export class JimengProvider extends BaseAIProvider {
  readonly name = 'jimeng';
  readonly displayName = '即梦AI绘画';
  readonly capabilities: ('text' | 'image')[] = ['image'];

  /**
   * 即梦主要用于图像生成，text chat返回提示使用图像生成接口
   */
  async chat(messages: ChatMessage[], _options?: ChatOptions): Promise<ChatResponse> {
    this.ensureInitialized();
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || '';

    // 即梦也可以理解prompt并优化，这里将prompt作为图像描述返回
    return {
      content: `请使用图像生成功能来处理您的描述："${prompt}"。即梦AI绘画支持文生图和图生图。`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: this.defaultModel,
      provider: this.name,
      durationMs: 0,
    };
  }

  /**
   * 文生图 / 图生图
   * 即梦API：POST /api/v1/images/generations
   */
  async generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse> {
    this.ensureInitialized();
    const startTime = Date.now();
    const model = this.defaultModel;

    const requestBody: Record<string, any> = {
      model,
      prompt,
      n: options?.count || 1,
      size: options?.size || '1024x1024',
    };

    if (options?.style) {
      requestBody.style = options.style;
    }
    if (options?.quality) {
      requestBody.quality = options.quality;
    }
    if (options?.refImage) {
      requestBody.image = options.refImage;
      requestBody.mode = 'img2img';
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

    // 即梦可能返回异步任务，需要轮询
    if (data.task_id || data.taskId) {
      return this.pollTaskResult(data.task_id || data.taskId, model, startTime);
    }

    // 同步返回
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
      usage: data.usage ? {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      } : undefined,
    };
  }

  /**
   * 轮询异步任务结果（即梦图像生成可能为异步）
   */
  private async pollTaskResult(
    taskId: string,
    model: string,
    startTime: number,
    maxWait = 120000,
    interval = 3000,
  ): Promise<ImageResponse> {
    const deadline = Date.now() + maxWait;

    while (Date.now() < deadline) {
      await this.sleep(interval);

      const response = await this.requestWithRetry(() =>
        this.httpRequest({
          method: 'GET',
          url: `${this.baseUrl}/tasks/${taskId}`,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }),
      );

      if (response.status !== 200) {
        throw this.parseError(response.status, response.data);
      }

      const data = response.data;
      const status = data.status || data.task_status;

      if (status === 'completed' || status === 'success') {
        const urls: string[] = [];
        if (data.output?.urls) {
          urls.push(...data.output.urls);
        } else if (data.images && Array.isArray(data.images)) {
          urls.push(...data.images.map((img: any) => img.url || img));
        } else if (data.data && Array.isArray(data.data)) {
          urls.push(...data.data.map((item: any) => item.url));
        }

        if (urls.length === 0) {
          throw new AIProviderError(
            'Task completed but no images returned',
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

      if (status === 'failed' || status === 'error') {
        throw new AIProviderError(
          data.error || 'Image generation task failed',
          this.name,
          AIErrorCode.UNKNOWN,
        );
      }

      // pending / processing - 继续轮询
      this.logger.debug(`Task ${taskId} status: ${status}, continuing to poll...`);
    }

    throw new AIProviderError(
      `Image generation task timed out after ${maxWait}ms`,
      this.name,
      AIErrorCode.TIMEOUT,
      408,
    );
  }

  async getModels(): Promise<ModelInfo[]> {
    return [
      {
        id: 'jimeng-v2',
        name: '即梦 V2',
        capabilities: ['image'],
        supportStream: false,
        inputPrice: 0,
        outputPrice: 10, // 按次计费：10圣力/次
      },
      {
        id: 'jimeng-v2-pro',
        name: '即梦 V2 Pro',
        capabilities: ['image'],
        supportStream: false,
        inputPrice: 0,
        outputPrice: 20, // 按次计费：20圣力/次
      },
    ];
  }
}
