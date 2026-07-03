/**
 * AI Service - 核心服务层
 * 协调 Provider调用、计费、日志记录
 */
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

import { AIProviderManager } from './providers/provider-manager';
import {
  ChatMessage,
  ChatOptions,
  ChatResponse,
  ImageOptions,
  ImageResponse,
  VideoOptions,
  VideoResponse,
  IAIProvider,
  ProviderStatus,
  AIProviderError,
} from './providers/ai-provider.interface';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { AiUserDailyQuota } from '../database/entities/ai-user-daily-quota.entity';
import { AiProvider } from './entities/ai-provider.entity';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly providerManager: AIProviderManager,
    private readonly configService: ConfigService,
    @InjectRepository(AiTool)
    private readonly toolRepo: Repository<AiTool>,
    @InjectRepository(AiCallRecord)
    private readonly callRecordRepo: Repository<AiCallRecord>,
    @InjectRepository(AiUserDailyQuota)
    private readonly quotaRepo: Repository<AiUserDailyQuota>,
    @InjectRepository(AiProvider)
    private readonly providerEntityRepo: Repository<AiProvider>,
    @InjectRepository(CoinAccount)
    private readonly coinAccountRepo: Repository<CoinAccount>,
    @InjectRepository(CoinTransaction)
    private readonly coinTxRepo: Repository<CoinTransaction>,
  ) {}

  /**
   * 文本对话
   */
  async chat(
    userId: number,
    toolId: number,
    messages: ChatMessage[],
    options?: ChatOptions,
    ip?: string,
  ): Promise<ChatResponse & { callRecordId: number; coinCost: number }> {
    // 1. 获取工具配置
    const tool = await this.toolRepo.findOne({
      where: { id: toolId, status: 'active' },
    });
    if (!tool) throw new NotFoundException('工具不存在或已停用');

    if (tool.toolType !== 'text' && tool.toolType !== 'analysis' && tool.toolType !== 'other') {
      throw new BadRequestException('该工具不支持文本对话');
    }

    // 2. 检查每日配额（免费工具）
    await this.checkDailyQuota(userId, tool);

    // 3. 计算预估费用 & 检查余额
    const estimatedCost = this.estimateChatCost(tool, messages);
    if (!tool.isFree && estimatedCost > 0) {
      await this.checkBalance(userId, estimatedCost);
    }

    // 4. 获取Provider
    let provider: IAIProvider | null = null;
    try {
      provider = this.resolveProvider(tool, options);
    } catch (err: any) {
      if (!tool.isFree) throw err;
      this.logger.warn(`免费工具 ${tool.name} Provider不可用，启用降级回复: ${err.message}`);
    }

    // 5. 调用AI
    const startTime = Date.now();
    const requestId = uuidv4();

    // 注入系统提示词
    if (tool.systemPrompt && messages[0]?.role !== 'system') {
      messages = [
        { role: 'system', content: tool.systemPrompt },
        ...messages,
      ];
    }

    let chatResponse: ChatResponse;
    try {
      if (!provider) {
        throw new Error('AI Provider 暂不可用');
      }
      chatResponse = await provider.chat(messages, {
        ...options,
        model: options?.model || tool.modelId,
      });
    } catch (err: any) {
      if (tool.isFree) {
        this.logger.warn(`免费工具 ${tool.name} AI调用失败，返回降级回复: ${err.message}`);
        const fallbackContent = this.buildFreeToolFallback(tool, messages);
        chatResponse = {
          content: fallbackContent,
          model: tool.modelId || 'fallback-free-tool',
          provider: 'fallback',
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
          durationMs: Date.now() - startTime,
        };
      } else {
      // 记录失败
      await this.recordCallResult(userId, toolId, requestId, {
        inputText: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
        status: 'failed',
        errorMessage: err.message?.substring(0, 500),
        modelUsed: tool.modelId,
        durationMs: Date.now() - startTime,
        ip,
      });
      throw err;
      }
    }

    const durationMs = Date.now() - startTime;

    // 6. 计算实际消耗圣力
    const actualCoinCost = this.calculateChatCoinCost(tool, chatResponse.usage);

    // 7. 扣费
    if (!tool.isFree && actualCoinCost > 0) {
      await this.deductCoins(userId, actualCoinCost, tool.name, toolId);
    }

    // 8. 记录调用日志
    const callRecord = await this.recordCallResult(userId, toolId, requestId, {
      inputText: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
      outputText: chatResponse.content,
      status: 'completed',
      modelUsed: chatResponse.model,
      tokensInput: chatResponse.usage.promptTokens,
      tokensOutput: chatResponse.usage.completionTokens,
      coinCost: tool.isFree ? 0 : actualCoinCost,
      durationMs,
      ip,
    });

    // 9. 更新工具使用次数
    await this.toolRepo.increment({ id: toolId }, 'usageCount', 1);
    await this.incrementDailyQuota(userId, tool);

    // 10. 更新Provider统计
    await this.updateProviderStats(tool.provider, chatResponse.usage.totalTokens, actualCoinCost);

    return {
      ...chatResponse,
      callRecordId: callRecord.id,
      coinCost: tool.isFree ? 0 : actualCoinCost,
    };
  }

  /**
   * 图像生成
   */
  async generateImage(
    userId: number,
    toolId: number,
    prompt: string,
    options?: ImageOptions,
    ip?: string,
  ): Promise<ImageResponse & { callRecordId: number; coinCost: number }> {
    // 1. 获取工具配置
    const tool = await this.toolRepo.findOne({
      where: { id: toolId, status: 'active' },
    });
    if (!tool) throw new NotFoundException('工具不存在或已停用');

    if (tool.toolType !== 'image') {
      throw new BadRequestException('该工具不支持图像生成');
    }

    // 2. 检查配额和余额
    await this.checkDailyQuota(userId, tool);
    const imageCost = this.estimateImageCost(tool, options);
    if (!tool.isFree && imageCost > 0) {
      await this.checkBalance(userId, imageCost);
    }

    // 3. 获取Provider
    const provider = this.resolveProvider(tool);
    if (!provider.generateImage) {
      throw new BadRequestException(`${provider.displayName} 不支持图像生成`);
    }

    // 4. 调用AI
    const startTime = Date.now();
    const requestId = uuidv4();

    let imageResponse: ImageResponse;
    try {
      imageResponse = await provider.generateImage(prompt, options);
    } catch (err: any) {
      await this.recordCallResult(userId, toolId, requestId, {
        inputText: prompt,
        status: 'failed',
        errorMessage: err.message?.substring(0, 500),
        modelUsed: tool.modelId,
        durationMs: Date.now() - startTime,
        ip,
      });
      throw err;
    }

    const durationMs = Date.now() - startTime;
    const actualCoinCost = tool.isFree ? 0 : imageCost;

    // 5. 扣费
    if (!tool.isFree && actualCoinCost > 0) {
      await this.deductCoins(userId, actualCoinCost, tool.name, toolId);
    }

    // 6. 记录调用日志
    const callRecord = await this.recordCallResult(userId, toolId, requestId, {
      inputText: prompt,
      outputFiles: imageResponse.urls,
      status: 'completed',
      modelUsed: imageResponse.model,
      coinCost: actualCoinCost,
      durationMs,
      ip,
    });

    // 7. 更新统计
    await this.toolRepo.increment({ id: toolId }, 'usageCount', 1);
    await this.updateProviderStats(tool.provider, 0, actualCoinCost);

    return {
      ...imageResponse,
      callRecordId: callRecord.id,
      coinCost: actualCoinCost,
    };
  }

  /**
   * 视频生成
   */
  async generateVideo(
    userId: number,
    toolId: number,
    prompt: string,
    options?: VideoOptions,
    ip?: string,
  ): Promise<VideoResponse & { callRecordId: number; coinCost: number }> {
    // 1. 获取工具配置
    const tool = await this.toolRepo.findOne({
      where: { id: toolId, status: 'active' },
    });
    if (!tool) throw new NotFoundException('工具不存在或已停用');

    if (tool.toolType !== 'video') {
      throw new BadRequestException('该工具不支持视频生成');
    }

    // 2. 检查配额和余额
    await this.checkDailyQuota(userId, tool);
    const videoCost = tool.isFree ? 0 : (tool.coinCost > 0 ? tool.coinCost : 20);
    if (!tool.isFree && videoCost > 0) {
      await this.checkBalance(userId, videoCost);
    }

    // 3. 获取Provider
    const provider = this.resolveProvider(tool);

    // 4. 调用AI视频生成
    const startTime = Date.now();
    const requestId = uuidv4();

    let videoResponse: VideoResponse;
    try {
      if (!provider.generateVideo) {
        // 没有视频生成能力的provider，使用第三方视频API
        videoResponse = await this.generateVideoViaThirdParty(prompt, options);
      } else {
        videoResponse = await provider.generateVideo(prompt, options);
      }
    } catch (err: any) {
      await this.recordCallResult(userId, toolId, requestId, {
        inputText: prompt,
        status: 'failed',
        errorMessage: err.message?.substring(0, 500),
        modelUsed: tool.modelId,
        durationMs: Date.now() - startTime,
        ip,
      });
      throw err;
    }

    const durationMs = Date.now() - startTime;

    // 5. 扣费
    if (!tool.isFree && videoCost > 0) {
      await this.deductCoins(userId, videoCost, tool.name, toolId);
    }

    // 6. 记录调用日志
    const callRecord = await this.recordCallResult(userId, toolId, requestId, {
      inputText: prompt,
      outputFiles: [videoResponse.videoUrl],
      status: 'completed',
      modelUsed: videoResponse.model,
      coinCost: videoCost,
      durationMs,
      ip,
    });

    // 7. 更新统计
    await this.toolRepo.increment({ id: toolId }, 'usageCount', 1);

    return {
      ...videoResponse,
      callRecordId: callRecord.id,
      coinCost: videoCost,
    };
  }

  /**
   * 通过火山引擎 Seedance API 生成视频
   */
  private async generateVideoViaThirdParty(
    prompt: string,
    options?: VideoOptions,
  ): Promise<VideoResponse> {
    const startTime = Date.now();
    
    const arkKey = this.configService.get<string>('ARK_API_KEY');
    const arkBaseUrl = this.configService.get<string>('ARK_BASE_URL') || 'https://ark.cn-beijing.volces.com/api/v3';
    
    if (!arkKey) {
      throw new Error('火山引擎 ARK_API_KEY 未配置，无法生成视频');
    }

    // Step 1: 创建视频生成任务
    const requestBody: Record<string, any> = {
      model: this.configService.get<string>('ARK_MODEL_VIDEO') || 'doubao-seedance-2-0-fast-260128',
      content: [
        {
          type: 'text',
          text: prompt,
        },
      ],
      duration: options?.duration || 5,
      resolution: options?.resolution || '720p',
      ratio: '16:9',
    };

    const createRes = await fetch(`${arkBaseUrl}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${arkKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`火山引擎视频任务创建失败(${createRes.status}): ${errText.substring(0, 200)}`);
    }

    const createData = await createRes.json();
    const taskId = createData.id;

    if (!taskId) {
      throw new Error('火山引擎视频任务创建失败：未返回任务ID');
    }

    // Step 2: 轮询任务状态（最多等待5分钟）
    const maxPolls = 60;
    for (let i = 0; i < maxPolls; i++) {
      await new Promise(r => setTimeout(r, 5000));

      const checkRes = await fetch(`${arkBaseUrl}/contents/generations/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${arkKey}`,
        },
      });

      if (!checkRes.ok) continue;

      const checkData = await checkRes.json();
      const status = checkData.status;

      if (status === 'succeeded') {
        const videoUrl = checkData.content?.video_url || '';
        return {
          videoUrl,
          thumbnailUrl: '',
          model: checkData.model || requestBody.model,
          provider: 'volcengine-seedance',
          durationMs: Date.now() - startTime,
        };
      }

      if (status === 'failed') {
        const errMsg = checkData.error?.message || '未知错误';
        throw new Error(`火山引擎视频生成失败: ${errMsg}`);
      }

      // queued 或 running，继续等待
    }

    throw new Error('视频生成超时（超过5分钟），请稍后重试');
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(category?: string): Promise<any> {
    let allModels = await this.providerManager.getAllModels();

    // 兜底：当没有任何Provider注册时，返回默认模型列表
    if (!allModels || allModels.length === 0) {
      this.logger.warn('无已注册的AI Provider，返回默认模型列表');
      allModels = [
        {
          provider: 'doubao',
          providerName: '豆包(火山引擎)',
          models: [
            {
              id: 'doubao-seed-2-0-pro-260215',
              name: '豆包 Seed 2.0 Pro',
              capabilities: ['text', 'code'],
              maxContextLength: 32768,
              supportStream: true,
              inputPrice: 0,
              outputPrice: 0,
            },
            {
              id: 'doubao-lite-32k',
              name: '豆包 Lite 32K',
              capabilities: ['text'],
              maxContextLength: 32768,
              supportStream: true,
              inputPrice: 0,
              outputPrice: 0,
            },
          ],
        },
        {
          provider: 'deepseek',
          providerName: 'DeepSeek',
          models: [
            {
              id: 'deepseek-chat',
              name: 'DeepSeek Chat',
              capabilities: ['text', 'code'],
              maxContextLength: 65536,
              supportStream: true,
              inputPrice: 0,
              outputPrice: 0,
            },
            {
              id: 'deepseek-v3',
              name: 'DeepSeek V3',
              capabilities: ['text', 'code'],
              maxContextLength: 65536,
              supportStream: true,
              inputPrice: 0,
              outputPrice: 0,
            },
          ],
        },
        {
          provider: 'tongyi',
          providerName: '通义千问',
          models: [
            {
              id: 'qwen-plus',
              name: '通义千问 Plus',
              capabilities: ['text', 'code'],
              maxContextLength: 131072,
              supportStream: true,
              inputPrice: 0.8,
              outputPrice: 2.0,
            },
            {
              id: 'qwen-turbo',
              name: '通义千问 Turbo',
              capabilities: ['text', 'code'],
              maxContextLength: 8192,
              supportStream: true,
              inputPrice: 0.3,
              outputPrice: 0.6,
            },
          ],
        },
      ];
    }

    if (category) {
      // 按类别过滤
      return allModels.map((group: any) => ({
        ...group,
        models: group.models.filter((m: any) => m.capabilities.includes(category as any)),
      })).filter((group: any) => group.models.length > 0);
    }

    return allModels;
  }

  /**
   * 获取Provider健康状态
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    return this.providerManager.getAllProviderStatus();
  }

  // ========== 私有辅助方法 ==========

  /**
   * 解析工具对应的Provider
   */
  private resolveProvider(tool: AiTool, options?: ChatOptions): IAIProvider {
    const providerName = tool.provider;
    try {
      return this.providerManager.getProvider(providerName);
    } catch {
      // 如果指定provider不可用，尝试路由
      if (tool.toolType === 'image') {
        return this.providerManager.routeRequest('image-generation');
      }
      return this.providerManager.routeRequest('text-generation', options?.model ? undefined : undefined);
    }
  }

  /**
   * 检查每日配额
   */
  private async checkDailyQuota(userId: number, tool: AiTool): Promise<void> {
    if (!tool.isFree || !tool.freeDailyLimit) return;

    const today = new Date().toISOString().split('T')[0];
    const quota = await this.quotaRepo.findOne({
      where: { userId, toolId: tool.id, usageDate: today },
    });

    if (quota && quota.callCount >= tool.freeDailyLimit) {
      throw new BadRequestException(`今日免费次数已用完（${tool.freeDailyLimit}次/天）`);
    }

    // 更新配额
    if (!quota) {
      const newQuota = this.quotaRepo.create({
        userId,
        toolId: tool.id,
        usageDate: today,
        callCount: 0,
        coinSpent: 0,
      });
      await this.quotaRepo.save(newQuota);
    }
  }

  private async incrementDailyQuota(userId: number, tool: AiTool): Promise<void> {
    if (!tool.isFree || !tool.freeDailyLimit) return;

    const today = new Date().toISOString().split('T')[0];
    let quota = await this.quotaRepo.findOne({
      where: { userId, toolId: tool.id, usageDate: today },
    });
    if (!quota) {
      quota = this.quotaRepo.create({ userId, toolId: tool.id, usageDate: today, callCount: 0, coinSpent: 0 });
    }
    quota.callCount += 1;
    await this.quotaRepo.save(quota);
  }

  private buildFreeToolFallback(tool: AiTool, messages: ChatMessage[]): string {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return [
      `已收到你在「${tool.name}」里的需求。`,
      '',
      '当前免费通道临时繁忙，我先给你一个可直接使用的基础版本，稍后再试可以获得更完整的 AI 结果：',
      '',
      lastUserMessage ? `需求：${lastUserMessage}` : '',
      '',
      '建议：请把目标人群、使用场景、语气风格、字数要求补充完整，生成效果会更稳定。若你刚刚是在生成标题，可以先使用“痛点 + 结果 + 数字/场景”的结构，例如：3个方法让你的内容更容易被看见。',
    ].filter(Boolean).join('\n');
  }

  /**
   * 检查余额
   */
  private async checkBalance(userId: number, requiredAmount: number): Promise<void> {
    const account = await this.coinAccountRepo.findOne({ where: { userId } });
    if (!account) {
      throw new BadRequestException('圣力账户不存在，请先充值');
    }
    if (account.balance < requiredAmount) {
      throw new BadRequestException(
        `圣力余额不足，需要 ${requiredAmount} 圣力，当前余额 ${account.balance} 圣力`,
      );
    }
  }

  /**
   * 扣费
   */
  private async deductCoins(userId: number, amount: number, toolName: string, toolId: number): Promise<void> {
    const account = await this.coinAccountRepo.findOne({ where: { userId } });
    if (!account || account.balance < amount) {
      throw new BadRequestException('圣力余额不足');
    }

    const balanceBefore = account.balance;
    account.balance -= amount;
    account.totalConsumed += amount;
    await this.coinAccountRepo.save(account);

    await this.coinTxRepo.save({
      userId,
      transactionType: 'consume',
      amount: -amount,
      balanceBefore,
      balanceAfter: account.balance,
      refType: 'ai_tool_call',
      refId: toolId,
      remark: `调用AI工具: ${toolName}`,
    });
  }

  /**
   * 预估文本对话费用（圣力）
   */
  private estimateChatCost(tool: AiTool, messages: ChatMessage[]): number {
    if (tool.isFree) return 0;

    // 如果工具有固定费用
    if (tool.coinCost > 0) return tool.coinCost;

    // 按token预估
    const pricing = this.configService.get<Record<string, any>>('ai.pricing.coinsPerKToken') || {};
    const modelPricing = pricing[tool.modelId] || { input: 1, output: 2 };

    const inputTokens = messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 2), 0);
    const estimatedOutputTokens = 2048; // 预估输出
    const cost = Math.ceil(
      (inputTokens / 1000) * modelPricing.input +
      (estimatedOutputTokens / 1000) * modelPricing.output,
    );
    return Math.max(cost, 1);
  }

  /**
   * 计算实际文本对话费用
   */
  private calculateChatCoinCost(
    tool: AiTool,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  ): number {
    if (tool.isFree) return 0;
    if (tool.coinCost > 0) return tool.coinCost;

    const pricing = this.configService.get<Record<string, any>>('ai.pricing.coinsPerKToken') || {};
    const modelPricing = pricing[tool.modelId] || pricing[usage.totalTokens > 0 ? tool.modelId : ''] || { input: 1, output: 2 };

    const cost = Math.ceil(
      (usage.promptTokens / 1000) * modelPricing.input +
      (usage.completionTokens / 1000) * modelPricing.output,
    );
    return Math.max(cost, 1);
  }

  /**
   * 预估图像生成费用
   */
  private estimateImageCost(tool: AiTool, _options?: ImageOptions): number {
    if (tool.isFree) return 0;
    if (tool.coinCost > 0) return tool.coinCost;

    const pricing = this.configService.get<Record<string, any>>('ai.pricing.imageFixedPrice') || {};
    return pricing[tool.modelId] || 10;
  }

  /**
   * 记录调用结果
   */
  private async recordCallResult(
    userId: number,
    toolId: number,
    requestId: string,
    data: {
      inputText?: string;
      outputText?: string;
      outputFiles?: string[];
      status: string;
      errorMessage?: string;
      modelUsed?: string;
      tokensInput?: number;
      tokensOutput?: number;
      coinCost?: number;
      durationMs?: number;
      ip?: string;
    },
  ): Promise<AiCallRecord> {
    // 检查是否已有pending记录（可更新）
    let record = await this.callRecordRepo.findOne({ where: { requestId } });
    if (record) {
      Object.assign(record, data);
      return this.callRecordRepo.save(record);
    }

    record = this.callRecordRepo.create({
      userId,
      toolId,
      requestId,
      inputText: data.inputText || null,
      outputText: data.outputText || null,
      outputFiles: data.outputFiles || null,
      modelUsed: data.modelUsed || null,
      tokensInput: data.tokensInput || 0,
      tokensOutput: data.tokensOutput || 0,
      coinCost: data.coinCost || 0,
      durationMs: data.durationMs || 0,
      status: data.status as any,
      errorMessage: data.errorMessage || null,
      ipAddress: data.ip || null,
    });
    return this.callRecordRepo.save(record);
  }

  /**
   * 更新Provider统计数据
   */
  private async updateProviderStats(providerName: string, tokens: number, costPoints: number): Promise<void> {
    try {
      await this.providerEntityRepo
        .createQueryBuilder()
        .update(AiProvider)
        .set({
          totalCalls: () => 'total_calls + 1',
          totalTokens: () => `total_tokens + ${tokens}`,
          totalCostPoints: () => `total_cost_points + ${costPoints}`,
        })
        .where('name = :name', { name: providerName })
        .execute();
    } catch {
      // 统计更新失败不影响主流程
      this.logger.warn(`Failed to update provider stats for ${providerName}`);
    }
  }
}
