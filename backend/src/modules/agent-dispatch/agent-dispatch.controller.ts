import { Controller, Get, Post, Param, Body, Req, Res } from '@nestjs/common';
import { AgentDispatchService } from './agent-dispatch.service';

@Controller()
export class AgentDispatchController {
  constructor(private readonly agentDispatchService: AgentDispatchService) {}

  @Get('agents')
  getAgents() {
    return this.agentDispatchService.getAgents();
  }

  @Get('agents/stats')
  getAgentStats() {
    return { code: 0, message: 'success', data: { total_chats: 0, total_users: 0, avg_response_time: 0 } };
  }

  @Get('agents/my-usage')
  getMyUsage() {
    return { code: 0, message: 'success', data: { total_chats: 0, total_coins_spent: 0, favorite_agents: [] } };
  }

  @Get('agents/:id')
  getAgentById(@Param('id') id: string) {
    return this.agentDispatchService.getAgentById(id);
  }

  @Post('agents/:id/chat/stream')
  async streamChat(
    @Param('id') agentId: string,
    @Body() body: { message: string },
    @Req() req: any,
    @Res() res: any,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    const userId = req.user ? req.user.id : 1;
    await this.agentDispatchService.streamChat(agentId, userId, body.message, res);
  }
}
