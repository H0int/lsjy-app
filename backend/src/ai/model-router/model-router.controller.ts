/**
 * Model Router Controller - 统一模型路由 API
 *
 * 端点（全局前缀 api/v1）：
 *  - GET  /api/v1/ai/router/models        获取路由表与可用模型清单（公开）
 *  - POST /api/v1/ai/router/chat          统一对话（JWT鉴权，按任务类型路由+自动降级）
 *  - POST /api/v1/ai/router/chat/stream   统一流式对话（JWT鉴权，SSE）
 */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ModelRouterService, TaskType } from './model-router.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ChatMessage } from '../providers/ai-provider.interface';
import type { Response } from 'express';

/** Router 对话请求体 */
interface RouterChatBody {
  /** 任务类型：simple/complex/code/vision/long_text（缺省 simple） */
  taskType?: string;
  /** 消息列表 */
  messages?: Array<{ role: string; content: string; imageUrl?: string }>;
  temperature?: number;
  maxTokens?: number;
  /** 显式指定模型（可选） */
  model?: string;
}

@ApiTags('ai-router')
@Controller('ai/router')
export class ModelRouterController {
  constructor(private readonly modelRouterService: ModelRouterService) {}

  /** 将请求体消息映射为 Provider 消息结构 */
  private toChatMessages(body: RouterChatBody): ChatMessage[] {
    return (body.messages || [])
      .filter((m) => m && typeof m.content === 'string')
      .map((m) => ({
        role: (['system', 'user', 'assistant'].includes(m.role) ? m.role : 'user') as
          | 'system'
          | 'user'
          | 'assistant',
        content: m.content,
        imageUrl: m.imageUrl,
      }));
  }

  // ===== 路由表与模型清单（公开） =====

  @Public()
  @Get('models')
  @ApiOperation({ summary: '获取模型路由表与可用模型清单' })
  async getModels() {
    const data = await this.modelRouterService.getRouterModels();
    return { code: 0, message: 'success', data };
  }

  // ===== 统一对话（JWT鉴权，非流式） =====

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  @ApiBearerAuth()
  @ApiOperation({ summary: '统一模型对话（按任务类型路由+自动降级）' })
  async chat(@Body() body: RouterChatBody) {
    const taskType: TaskType = this.modelRouterService.resolveTaskType(body.taskType);
    const messages = this.toChatMessages(body);

    if (messages.length === 0) {
      return { code: 400, message: '请输入你的问题', data: null };
    }

    try {
      const result = await this.modelRouterService.chat(taskType, messages, {
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        model: body.model,
      });
      return {
        code: 0,
        message: 'success',
        data: {
          content: result.content,
          reply: result.content,
          model: result.model,
          provider: result.provider,
          taskType: result.taskType,
          usage: result.usage,
          durationMs: result.durationMs,
          fallbackUsed: result.fallbackUsed,
          coinCost: 0,
        },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知错误';
      return { code: 503, message: `AI服务暂时不可用：${message}`, data: null };
    }
  }

  // ===== 统一流式对话（JWT鉴权，SSE） =====

  @UseGuards(JwtAuthGuard)
  @Post('chat/stream')
  @ApiBearerAuth()
  @ApiOperation({ summary: '统一模型流式对话（SSE）' })
  async chatStream(@Body() body: RouterChatBody, @Res() res: Response) {
    // SSE 响应头（X-Accel-Buffering:no 关闭 nginx 缓冲，确保流式实时下发）
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const send = (obj: unknown) => {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    const taskType: TaskType = this.modelRouterService.resolveTaskType(body.taskType);
    const messages = this.toChatMessages(body);

    if (messages.length === 0) {
      send({ type: 'error', message: '请输入你的问题' });
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    try {
      const result = await this.modelRouterService.chat(taskType, messages, {
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        model: body.model,
        onStream: (chunk) => send({ type: 'chunk', content: chunk }),
      });
      send({
        type: 'done',
        model: result.model,
        provider: result.provider,
        taskType: result.taskType,
        usage: result.usage,
        fallbackUsed: result.fallbackUsed,
        coinCost: 0,
      });
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '生成失败';
      try {
        send({ type: 'error', message });
        res.write('data: [DONE]\n\n');
      } catch {
        /* 连接可能已断开 */
      }
      res.end();
    }
  }
}
