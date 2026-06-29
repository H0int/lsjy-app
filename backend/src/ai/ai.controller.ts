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
      messages.unshift({ role: 'system', content: dto.systemPrompt });
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
      messages.unshift({ role: 'system', content: dto.systemPrompt });
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

  // ===== 快捷聊天（公开接口，直接调Coze Bot） =====

  @Public()
  @Post('chat')
  @ApiOperation({ summary: '快捷AI对话（无需登录）' })
  async quickChat(@Body() body: { message?: string; messages?: Array<{role: string; content: string}>; model?: string; modelName?: string }) {
    // 支持前端发送的两种格式：
    // 1. { message: "...", modelName: "..." } （旧格式）
    // 2. { messages: [...], model: "..." } （新格式）
    const apiKey = process.env.DEEPSEEK_API_KEY || '';
    const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    
    if (!apiKey) {
      return { data: { reply: 'AI服务未配置，请联系管理员。' } };
    }
    
    // 构建 messages 数组
    let messages: Array<{role: string; content: string}> = [];
    if (Array.isArray(body?.messages) && body.messages.length > 0) {
      messages = body.messages.map(m => ({
        role: m.role || 'user',
        content: m.content || ''
      }));
    } else if (body?.message?.trim()) {
      messages = [{ role: 'user', content: body.message }];
    } else {
      return { data: { reply: '请输入你的问题。' } };
    }

    try {
      const res = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });
      
      if (!res.ok) {
        const errText = await res.text();
        return { data: { reply: 'AI服务调用失败(' + res.status + ')，请稍后再试。' } };
      }
      
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，AI未返回有效回复。';
      return { data: { reply, coinCost: 0 } };
    } catch (e: any) {
      return { data: { reply: 'AI服务异常: ' + (e.message || '未知错误') + '，请稍后再试。' } };
    }
  }


  // ===== 罗圣AI快捷对话（前端AgentChat调用） =====

  @UseGuards(JwtAuthGuard)
  @Post('luosheng')
  @ApiBearerAuth()
  @ApiOperation({ summary: '罗圣AI对话（AgentChat专用）' })
  async luoshengChat(
    @CurrentUser('id') userId: number,
    @Body() body: { messages: Array<{role: string; content: string}>; model?: string; content?: string },
    @Req() req: Request,
  ) {
    // 提取最后一条用户消息
    const userMessages = body.messages || [];
    const lastUserMsg = userMessages.filter(m => m.role === 'user').pop();
    const userContent = lastUserMsg?.content || body.content || '';

    if (!userContent.trim()) {
      return { data: { content: '请输入你的问题', model: '系统' } };
    }

    // 构建对话消息
    const chatMessages = userMessages.map(m => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

    try {
      // 尝试使用Coze Bot
      const apiKey = process.env.COZE_API_KEY || '';
      const botId = process.env.COZE_BOT_ID || '';

      if (apiKey && botId) {
        const chatRes = await fetch('https://api.coze.cn/v3/chat', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bot_id: botId,
            user_id: 'lsjy_user_' + userId,
            additional_messages: [{ role: 'user', content: userContent, content_type: 'text' }],
            stream: false,
            auto_save_history: true,
          }),
        });

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          const d = chatData.data || chatData;
          if (d.id) {
            // Poll for answer
            for (let i = 0; i < 20; i++) {
              await new Promise(r => setTimeout(r, 1500));
              const listRes = await fetch(
                'https://api.coze.cn/v3/chat/message/list?chat_id=' + d.id + '&conversation_id=' + (d.conversation_id || ''),
                { headers: { 'Authorization': 'Bearer ' + apiKey } }
              );
              const listData = await listRes.json();
              const msgs = listData.data || [];
              const answerMsg = msgs.find((m: any) => m.type === 'answer' && m.content);
              if (answerMsg) {
                return { data: { content: answerMsg.content, model: '罗圣AI' } };
              }
              if (d.status === 'completed' || d.status === 'failed') break;
            }
          }
        }
      }

      // Fallback: 使用已注册的AI Provider
      try {
        const provider = this.providerManager.routeRequest('text-generation');
        const result = await provider.chat(chatMessages, {
          model: body.model || undefined,
        });
        return {
          data: {
            content: result.content,
            model: result.model || provider.name,
          }
        };
      } catch (providerErr: any) {
        return { data: { content: 'AI服务暂时不可用，请稍后再试', model: '系统' } };
      }
    } catch (e: any) {
      return { data: { content: 'AI服务异常: ' + (e.message || '未知错误'), model: '系统' } };
    }
  }

}
