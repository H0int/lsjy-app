import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

const COZE_AGENTS = [
  { id: 1, name: '罗圣AI助手', botId: '7651223356586786856', clawId: '7650538810509672710', category: 'general', description: '全能AI助手', coinCost: 1, status: 'active' },
  { id: 2, name: '自媒体运营', botId: '7656090968982093860', clawId: '7650711343091269934', category: 'content', description: '内容创作与运营', coinCost: 2, status: 'active' },
  { id: 3, name: '调研分析师', botId: '7656087553254440969', clawId: '7650711649514586414', category: 'research', description: '深度调研分析', coinCost: 3, status: 'active' },
  { id: 4, name: '投资理财顾问', botId: '7656086433756971059', clawId: '7650711605264744731', category: 'finance', description: '投资理财建议', coinCost: 3, status: 'active' },
  { id: 5, name: '科研助理', botId: '7656085382597673001', clawId: '7650711324414230835', category: 'research', description: '学术研究辅助', coinCost: 2, status: 'active' },
  { id: 6, name: '法务顾问', botId: '7656090577955618851', clawId: '7650712487255638281', category: 'legal', description: '法律咨询服务', coinCost: 5, status: 'active' },
  { id: 7, name: '龙虾员工', botId: '7656089181064052751', clawId: '7650724371367035186', category: 'dev', description: '后端开发', coinCost: 2, status: 'active' },
  { id: 8, name: '代码分析师', botId: '7656086515747258394', clawId: '7650723341866844443', category: 'dev', description: '代码分析审查', coinCost: 2, status: 'active' },
  { id: 9, name: 'oeClaw领航', botId: '7656088889505202228', clawId: '7650723120738894126', category: 'dev', description: '技术导航', coinCost: 2, status: 'active' },
  { id: 10, name: '代码助手', botId: '7656087950807662632', clawId: '7650723637393146139', category: 'dev', description: '编程助手', coinCost: 1, status: 'active' },
  { id: 11, name: 'Claude Code', botId: '7656083123025281074', clawId: '7655022735071985939', category: 'dev', description: '高级编程', coinCost: 5, status: 'active' },
  { id: 12, name: 'Codex CLI', botId: '7656090600215248911', clawId: '7655025985565507876', category: 'dev', description: '命令行编程', coinCost: 5, status: 'active' },
  { id: 13, name: 'Coze Agent', botId: '7656091110649020457', clawId: '7655023966079467782', category: 'general', description: '通用助手', coinCost: 1, status: 'active' },
  { id: 14, name: 'OpenClaw', botId: '7656088889505300532', clawId: '7655146811375681827', category: 'general', description: '开源能力', coinCost: 2, status: 'active' },
  { id: 15, name: '开发Agent', botId: '7656090600215298063', clawId: '7655633499529199881', category: 'dev', description: '开发辅助', coinCost: 2, status: 'active' },
];

@Injectable()
export class AgentDispatchService {
  private cozeToken: string;
  private cozeBaseUrl = 'https://api.coze.cn/v3';

  constructor(private readonly configService: ConfigService) {
    this.cozeToken = this.configService.get('COZE_API_TOKEN') || 'pat_PzQlUbxdIXu7txW3cvP69EpHRLSidiY8KKa3NQ98KncpAA8jnOIZpZZMnJQd2ld5';
  }

  getAgents() {
    return { code: 0, message: 'success', data: { items: COZE_AGENTS, total: COZE_AGENTS.length } };
  }

  getAgentById(id: string) {
    const agent = COZE_AGENTS.find(a => a.id === Number(id));
    if (!agent) throw new HttpException({ code: 404, message: 'Agent不存在' }, HttpStatus.NOT_FOUND);
    return { code: 0, message: 'success', data: agent };
  }

  async streamChat(agentId: string, userId: number, message: string, res: any): Promise<void> {
    const agent = COZE_AGENTS.find(a => a.id === Number(agentId));
    if (!agent) throw new HttpException({ code: 404, message: 'Agent不存在' }, HttpStatus.NOT_FOUND);

    const body = JSON.stringify({
      bot_id: agent.botId,
      user_id: String(userId),
      additional_messages: [{ role: 'user', content: message, content_type: 'text' }],
      stream: true,
      auto_save_history: true,
    });

    return new Promise((resolve, reject) => {
      const url = new URL(this.cozeBaseUrl + '/chat');
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.cozeToken,
          'Content-Length': Buffer.byteLength(body),
        },
      };

      let doneSent = false;
      let conversationId = '';
      let lastAnswer = '';

      const sendDone = () => {
        if (!doneSent) {
          doneSent = true;
          res.write('data: ' + JSON.stringify({ type: 'done', conversationId }) + '\n\n');
          res.end();
        }
      };

      const processLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('event:')) return;
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.substring(5).trim();
          if (dataStr === '"[DONE]"') { sendDone(); return; }
          try {
            const data = JSON.parse(dataStr);
            if (data.conversation_id) conversationId = data.conversation_id;
            if (data.type === 'answer' && data.content) {
              if (!lastAnswer || data.content !== lastAnswer) {
                lastAnswer = data.content;
                res.write('data: ' + JSON.stringify({ type: 'delta', content: data.content }) + '\n\n');
              }
            }
          } catch (e) {}
        }
      };

      const req = https.request(options, (cozeRes) => {
        let buffer = '';
        cozeRes.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) processLine(line);
        });
        cozeRes.on('end', () => {
          if (buffer.trim()) processLine(buffer);
          sendDone();
          this.recordUsage(userId, agent.id, message, 'stream');
          resolve();
        });
        cozeRes.on('error', (err) => {
          try { res.write('data: ' + JSON.stringify({ type: 'error', message: err.message }) + '\n\n'); } catch(e) {}
          sendDone();
          reject(err);
        });
      });

      req.on('error', (err) => {
        try { res.write('data: ' + JSON.stringify({ type: 'error', message: err.message }) + '\n\n'); } catch(e) {}
        sendDone();
        reject(err);
      });

      req.write(body);
      req.end();
    });
  }

  private recordUsage(userId: number, agentId: number, message: string, mode: string) {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      let usageLog: any[] = [];
      try { usageLog = JSON.parse(fs.readFileSync(path.join(dataDir, 'usage_log.json'), 'utf8')); } catch(e) {}
      usageLog.push({ userId, agentId, message: message.substring(0, 200), timestamp: new Date().toISOString(), status: 'success', mode });
      if (usageLog.length > 10000) usageLog = usageLog.slice(-10000);
      fs.writeFileSync(path.join(dataDir, 'usage_log.json'), JSON.stringify(usageLog, null, 2));
    } catch (e) {}
  }
}
