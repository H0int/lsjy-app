import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/auth';
import {
  getModelConfig,
  getProviderConfig,
  getModelList,
  IMAGE_MODELS,
  DEFAULT_IMAGE_MODEL,
} from '../config';
import { SiliconFlowService } from '../services/siliconflow';
import { ZhipuService } from '../services/zhipu';
import { DashscopeService } from '../services/dashscope';
import { Provider, StreamChunk, ChatMessage } from '../types';

const router = Router();

// 所有 AI 路由都需要认证
router.use(authMiddleware);

// ============ 服务实例（懒加载） ============
const serviceInstances: Record<string, SiliconFlowService | ZhipuService | DashscopeService> = {};

function getService(provider: Provider): SiliconFlowService | ZhipuService | DashscopeService {
  if (!serviceInstances[provider]) {
    const config = getProviderConfig(provider);
    if (!config.apiKey) {
      throw new Error(`提供商 ${config.name} 的 API Key 未配置，请设置环境变量`);
    }
    switch (provider) {
      case 'siliconflow':
        serviceInstances[provider] = new SiliconFlowService(config);
        break;
      case 'zhipu':
        serviceInstances[provider] = new ZhipuService(config);
        break;
      case 'dashscope':
        serviceInstances[provider] = new DashscopeService(config);
        break;
    }
  }
  return serviceInstances[provider];
}

// ============ GET /api/v1/ai/models ============
router.get('/models', (_req: Request, res: Response) => {
  const models = getModelList();
  res.json({ models });
});

// ============ POST /api/v1/ai/chat/stream (SSE 流式) ============
router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const { model: modelId, messages, temperature, max_tokens } = req.body;

    if (!modelId) {
      res.status(400).json({ error: '缺少 model 参数' });
      return;
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: '缺少 messages 参数' });
      return;
    }

    // 查找模型配置
    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      res.status(400).json({
        error: `不支持的模型: ${modelId}`,
        hint: '请调用 GET /api/v1/ai/models 获取可用模型列表',
      });
      return;
    }

    // 获取对应服务
    const service = getService(modelConfig.provider);

    // 设置 SSE 响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',  // nginx 禁用缓冲
    });

    // 调用上游流式 API
    const upstreamStream = await service.chatStream(
      modelConfig.model,
      messages,
      { temperature, max_tokens }
    );

    let buffer = '';
    const chatId = `chatcmpl-${uuidv4().substring(0, 8)}`;

    // 处理上游 SSE 数据
    upstreamStream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString();

      // 按行处理
      const lines = buffer.split('\n');
      // 保留最后一个可能不完整的行
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        // 跳过空行和注释
        if (!trimmed || trimmed.startsWith(':')) continue;

        // 处理 data: 行
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.substring(6);

          // 上游发送 [DONE]
          if (data === '[DONE]') {
            res.write('data: [DONE]\n\n');
            return;
          }

          try {
            const parsed = JSON.parse(data) as any;
            const content = parsed.choices?.[0]?.delta?.content;

            if (content !== undefined) {
              // 重新格式化为我们自己的 SSE 格式
              const output: StreamChunk = {
                id: chatId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: modelId,
                choices: [{
                  delta: { content },
                  finish_reason: null,
                  index: 0,
                }],
              };
              res.write(`data: ${JSON.stringify(output)}\n\n`);
            }

            // 检查是否有 finish_reason
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              const finalChunk: StreamChunk = {
                id: chatId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: modelId,
                choices: [{
                  delta: {},
                  finish_reason: finishReason,
                  index: 0,
                }],
              };
              res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
            }
          } catch (e) {
            // 解析失败的行忽略（可能是心跳等非标准数据）
            console.warn('SSE parse warning:', data.substring(0, 100));
          }
        }
      }
    });

    upstreamStream.on('end', () => {
      // 确保发送 [DONE]
      res.write('data: [DONE]\n\n');
      res.end();
    });

    upstreamStream.on('error', (err: Error) => {
      console.error('上游流错误:', err.message);
      // 尝试发送错误事件
      try {
        const errorData = JSON.stringify({
          error: { message: '上游 AI 服务异常', type: 'upstream_error' },
        });
        res.write(`data: ${errorData}\n\n`);
        res.write('data: [DONE]\n\n');
      } catch {
        // 如果写入失败，直接结束
      }
      res.end();
    });

    // 客户端断开时取消上游请求
    req.on('close', () => {
      (upstreamStream as any).destroy();
    });

  } catch (err: any) {
    console.error('流式对话错误:', err.message);

    // 如果还没有设置 SSE 头，返回 JSON 错误
    if (!res.headersSent) {
      res.status(500).json({
        error: 'AI 服务调用失败',
        message: err.message,
      });
    } else {
      // SSE 已开始，发送错误事件
      try {
        const errorData = JSON.stringify({
          error: { message: err.message, type: 'server_error' },
        });
        res.write(`data: ${errorData}\n\n`);
        res.write('data: [DONE]\n\n');
      } catch {
        // ignore
      }
      res.end();
    }
  }
});

// ============ POST /api/v1/ai/chat (非流式) ============
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { model: modelId, messages, temperature, max_tokens } = req.body;

    if (!modelId || !messages) {
      res.status(400).json({ error: '缺少 model 或 messages 参数' });
      return;
    }

    const modelConfig = getModelConfig(modelId);
    if (!modelConfig) {
      res.status(400).json({ error: `不支持的模型: ${modelId}` });
      return;
    }

    const service = getService(modelConfig.provider);
    const result = await service.chat(modelConfig.model, messages, {
      temperature,
      max_tokens,
    });

    // 格式化返回
    res.json({
      id: result.id || `chatcmpl-${uuidv4().substring(0, 8)}`,
      object: 'chat.completion',
      created: result.created || Math.floor(Date.now() / 1000),
      model: modelId,
      choices: result.choices?.map((c: any, i: number) => ({
        index: i,
        message: {
          role: c.message?.role || 'assistant',
          content: c.message?.content || '',
        },
        finish_reason: c.finish_reason || 'stop',
      })) || [],
    });
  } catch (err: any) {
    console.error('非流式对话错误:', err.message);
    res.status(500).json({
      error: 'AI 服务调用失败',
      message: err.message,
    });
  }
});

// ============ POST /api/v1/ai/generate-image ============
router.post('/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, model, size } = req.body;

    if (!prompt) {
      res.status(400).json({ error: '缺少 prompt 参数' });
      return;
    }

    const imageModelId = model || DEFAULT_IMAGE_MODEL;
    const imageModelConfig = IMAGE_MODELS[imageModelId];

    if (!imageModelConfig) {
      res.status(400).json({
        error: `不支持的图片模型: ${imageModelId}`,
        available: Object.keys(IMAGE_MODELS),
      });
      return;
    }

    const service = getService(imageModelConfig.provider);

    let result;
    if (service instanceof SiliconFlowService) {
      result = await service.generateImage(prompt, imageModelConfig.model, size || '1024x1024');
    } else if (service instanceof ZhipuService) {
      result = await service.generateImage(prompt, imageModelConfig.model, size || '1024x1024');
    } else {
      res.status(400).json({ error: '该提供商不支持图片生成' });
      return;
    }

    res.json({
      url: result.url,
      model: imageModelId,
      prompt,
    });
  } catch (err: any) {
    console.error('图片生成错误:', err.message);
    res.status(500).json({
      error: '图片生成失败',
      message: err.message,
    });
  }
});

// ============ POST /api/v1/ai/tools/:id/use ============
router.post('/tools/:id/use', async (req: Request, res: Response) => {
  try {
    const toolId = req.params.id;
    const { input, ...extraParams } = req.body;

    if (!input) {
      res.status(400).json({ error: '缺少 input 参数' });
      return;
    }

    // 内置工具实现
    const builtInTools: Record<string, (input: string, params: any) => Promise<string>> = {
      // 翻译工具
      'translate': async (input: string, params: any) => {
        const targetLang = params.targetLang || 'English';
        const service = getService('siliconflow');
        const result = await service.chat('Qwen/Qwen2.5-7B-Instruct', [
          { role: 'system', content: `You are a professional translator. Translate the following text to ${targetLang}. Only output the translation, nothing else.` },
          { role: 'user', content: input },
        ], { temperature: 0.3 });
        return result.choices?.[0]?.message?.content || input;
      },
      // 摘要工具
      'summarize': async (input: string) => {
        const service = getService('siliconflow');
        const result = await service.chat('Qwen/Qwen2.5-7B-Instruct', [
          { role: 'system', content: '请用简洁的中文总结以下内容，保留关键信息。' },
          { role: 'user', content: input },
        ], { temperature: 0.3, max_tokens: 1024 });
        return result.choices?.[0]?.message?.content || '摘要生成失败';
      },
      // 代码解释
      'explain-code': async (input: string) => {
        const service = getService('siliconflow');
        const result = await service.chat('Qwen/Qwen2.5-7B-Instruct', [
          { role: 'system', content: '你是一个编程助手，请用中文详细解释以下代码的功能和逻辑。' },
          { role: 'user', content: input },
        ], { temperature: 0.3 });
        return result.choices?.[0]?.message?.content || '解释生成失败';
      },
      // 通用文本处理（回退到通用 AI）
      'text-process': async (input: string, params: any) => {
        const service = getService('siliconflow');
        const instruction = params.instruction || '请处理以下文本';
        const result = await service.chat('deepseek-ai/DeepSeek-V2.5-128K', [
          { role: 'system', content: instruction },
          { role: 'user', content: input },
        ], { temperature: 0.5 });
        return result.choices?.[0]?.message?.content || '处理失败';
      },
    };

    const toolFn = builtInTools[toolId];
    if (!toolFn) {
      res.status(404).json({
        error: `工具 ${toolId} 不存在`,
        available: Object.keys(builtInTools),
      });
      return;
    }

    const result = await toolFn(input, extraParams);

    res.json({
      result,
      content: result,
      tool: toolId,
    });
  } catch (err: any) {
    console.error(`工具 ${req.params.id} 调用错误:`, err.message);
    res.status(500).json({
      error: '工具调用失败',
      message: err.message,
    });
  }
});

export default router;
