/**
 * AI Controller - 统一AI能力入口
 */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Sse,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { AIProviderManager } from './providers/provider-manager';
import { ChatDto } from './dto/chat.dto';
import { GenerateImageDto } from './dto/generate-image.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { Request } from 'express';
import { Observable, Subject } from 'rxjs';

@ApiTags('ai')
@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly providerManager: AIProviderManager,
  ) {}

  // ===== 模型与Provider查询 =====

  @Public()
  @Get('providers')
  @ApiOperation({ summary: '获取所有AI Provider状态' })
  async getProviders() {
    const status = await this.providerManager.getAllProviderStatus();
    return { data: status };
  }

  @Public()
  @Get('models')
  @ApiOperation({ summary: '获取所有可用模型列表' })
  @ApiQuery({ name: 'category', required: false, description: '按能力过滤: text/image/code/multimodal' })
  async getModels(@Query('category') category?: string) {
    const models = await this.aiService.getAvailableModels(category);
    return { data: models };
  }

  // ===== 文本对话 =====

  @UseGuards(JwtAuthGuard)
  @Post('tools/:toolId/chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI文本对话' })
  async chat(
    @CurrentUser('id') userId: number,
    @Param('toolId') toolId: number,
    @Body() dto: ChatDto,
    @Req() req: Request,
  ) {
    const messages = dto.messages.map((m) => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
    }));

    const options = {
      model: dto.model,
      temperature: dto.temperature,
      maxTokens: dto.maxTokens,
      stream: dto.stream,
      topP: dto.topP,
      stop: dto.stop,
    };

    // 注入系统提示
    if (dto.systemPrompt) {
      messages.unshift({ role: 'system', content: dto.systemPrompt, imageUrl: undefined });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const result = await this.aiService.chat(userId, toolId, messages, options, ip);
    return { data: result };
  }

  /**
   * 流式文本对话 (SSE)
   */
  @UseGuards(JwtAuthGuard)
  @Post('tools/:toolId/chat/stream')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI流式文本对话（SSE）' })
  async chatStream(
    @CurrentUser('id') userId: number,
    @Param('toolId') toolId: number,
    @Body() dto: ChatDto,
    @Req() req: Request,
  ) {
    const messages = dto.messages.map((m) => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
    }));

    if (dto.systemPrompt) {
      messages.unshift({ role: 'system', content: dto.systemPrompt, imageUrl: undefined });
    }

    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';

    // 使用SSE方式返回
    return new Observable((subscriber) => {
      const subject = new Subject<string>();

      const run = async () => {
        try {
          const result = await this.aiService.chat(userId, toolId, messages, {
            model: dto.model,
            temperature: dto.temperature,
            maxTokens: dto.maxTokens,
            stream: true,
            topP: dto.topP,
            onStream: (chunk) => {
              subscriber.next(JSON.stringify({ type: 'chunk', content: chunk }));
            },
          }, ip);

          // 发送完成事件（包含计费和用量信息）
          subscriber.next(JSON.stringify({
            type: 'done',
            usage: result.usage,
            model: result.model,
            provider: result.provider,
            coinCost: result.coinCost,
            callRecordId: result.callRecordId,
          }));
          subscriber.complete();
        } catch (err: any) {
          subscriber.next(JSON.stringify({
            type: 'error',
            message: err.message || '生成失败',
          }));
          subscriber.complete();
        }
      };

      run();
    });
  }

  // ===== 罗圣AI 专属端点 =====

  private readonly LUOSHENG_SYSTEM_PROMPT = `你是"罗圣AI"——罗圣纪元互联网科技有限责任公司的官方AI智能体，也是公司创始人罗凯中（罗总）的数字分身。

## 罗总个人档案
- 姓名：罗凯中，出生于2005年4月30日，籍贯湖南永州祁阳
- 教育：白沙小学 → 浯溪二中 → 郡祁高级中学 → 湖南生物机电职业技术学院东湖校区（长沙芙蓉区）动物科技学院动物医学专业，2026年6月25日毕业
- 现任：罗圣纪元互联网科技有限责任公司 董事长兼CEO
- 电话：18774656292 / 18890000368

## 六大业务模块
1. AI（人工智能）2. 电商 3. 自媒体 4. 教育咨询 5. 宠物 6. 伯雅校园

## 角色设定
你是罗总的数字分身，以第一人称与用户交流。语言专业自信、亲和务实。永远不说"作为AI助手"之类出戏的话。`;

  @UseGuards(JwtAuthGuard)
  @Post('luosheng')
  @ApiBearerAuth()
  @ApiOperation({ summary: '罗圣AI专属对话（罗总数字分身）' })
  async luoshengChat(
    @CurrentUser('id') userId: number,
    @Body() dto: ChatDto,
    @Req() req: Request,
  ) {
    const messages = dto.messages.map((m) => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
    }));

    // 注入罗圣专属系统提示
    const systemPrompt = dto.systemPrompt || this.LUOSHENG_SYSTEM_PROMPT;
    messages.unshift({ role: 'system', content: systemPrompt, imageUrl: undefined });

    const options = {
      model: dto.model,
      temperature: dto.temperature ?? 0.85,
      maxTokens: dto.maxTokens ?? 4000,
      stream: dto.stream,
      topP: dto.topP,
      stop: dto.stop,
    };

    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const result = await this.aiService.chat(userId, 1, messages, options, ip);
    return { code: 0, data: { content: result.content, model: '罗圣AI', usage: result.usage, balance: result.coinCost } };
  }

  // ===== 图像生成 =====

  @UseGuards(JwtAuthGuard)
  @Post('tools/:toolId/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI图像生成' })
  async generateImage(
    @CurrentUser('id') userId: number,
    @Param('toolId') toolId: number,
    @Body() dto: GenerateImageDto,
    @Req() req: Request,
  ) {
    const options: import('./providers/ai-provider.interface').ImageOptions = {
      size: dto.size,
      style: dto.style,
      count: dto.count,
      quality: dto.quality,
      refImage: dto.refImage,
    };

    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
    const result = await this.aiService.generateImage(userId, toolId, dto.prompt, options, ip);
    return { data: result };
  }
}

