import fetch from 'node-fetch';
import { ProviderConfig } from '../types';

export class CozeService {
  private baseUrl = 'https://api.coze.cn';

  constructor(private config: ProviderConfig) {}

  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; max_tokens?: number; userId?: string }
  ): Promise<any> {
    const userId = options?.userId || 'luosheng_user';
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const systemMsg = messages.find(m => m.role === 'system');

    const additionalMessages: any[] = [];
    if (systemMsg) {
      additionalMessages.push({ role: 'user', content: `[系统指令] ${systemMsg.content}`, content_type: 'text' });
    }
    if (lastUserMsg) {
      additionalMessages.push({ role: 'user', content: lastUserMsg.content, content_type: 'text' });
    }

    const chatResponse = await fetch(`${this.baseUrl}/v3/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({
        bot_id: model, user_id: userId, stream: false, auto_save_history: true,
        additional_messages: additionalMessages,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Coze 对话创建失败: ${errorText}`);
    }

    const chatData: any = await chatResponse.json();
    const chatId = chatData.data?.id;
    const convId = chatData.data?.conversation_id;

    if (!chatId) {
      throw new Error('Coze 对话创建失败: ' + JSON.stringify(chatData));
    }

    // Poll message/list instead of retrieve (retrieve returns 4001 for completed chats)
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;

      try {
        const msgResponse = await fetch(
          `${this.baseUrl}/v3/chat/message/list?conversation_id=${convId}&chat_id=${chatId}&bot_id=${model}`,
          { method: 'GET', headers: { 'Authorization': `Bearer ${this.config.apiKey}` } }
        );

        if (msgResponse.ok) {
          const msgData: any = await msgResponse.json();
          const answerMessages = (msgData.data || []).filter(
            (m: any) => m.role === 'assistant' && m.type === 'answer'
          );
          if (answerMessages.length > 0) {
            const answerContent = answerMessages.map((m: any) => m.content).join('\n') || '';
            if (answerContent) {
              return {
                id: chatId, object: 'chat.completion',
                created: Math.floor(Date.now() / 1000), model,
                choices: [{ message: { role: 'assistant', content: answerContent }, finish_reason: 'stop', index: 0 }],
              };
            }
          }
        }
      } catch {}
    }

    throw new Error('Coze 智能体响应超时');
  }

  async chatStream(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options?: { temperature?: number; max_tokens?: number; userId?: string }
  ): Promise<NodeJS.ReadableStream> {
    const result = await this.chat(model, messages, options);
    const content = result.choices?.[0]?.message?.content || '';
    const { Readable } = require('stream');
    const stream = new Readable({ read() {} });

    const chunkSize = 50;
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      const chunkData = JSON.stringify({
        id: result.id, object: 'chat.completion.chunk', created: result.created, model,
        choices: [{ delta: { content: chunk }, finish_reason: null, index: 0 }],
      });
      stream.push(`data: ${chunkData}\n\n`);
    }
    stream.push(`data: ${JSON.stringify({ id: result.id, object: 'chat.completion.chunk', created: result.created, model, choices: [{ delta: {}, finish_reason: 'stop', index: 0 }] })}\n\n`);
    stream.push('data: [DONE]\n\n');
    stream.push(null);
    return stream;
  }
}
