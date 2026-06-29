
import { Controller, Get, Post, Param, Body, Req, UseGuards, HttpCode, Logger } from '@nestjs/common';
import { Request } from 'express';
import { McpService, McpTool } from './mcp.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('mcp')
@UseGuards(AuthGuard('jwt'))
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpService: McpService) {}

  private getTenantId(req: any): string {
    const tenantId = req.user?.tenantId || req.user?.id || req.user?.sub;
    if (!tenantId) {
      throw new Error('Tenant context not found in request');
    }
    return String(tenantId);
  }

  @Get('tools')
  async listTools(@Req() req: Request): Promise<{ tools: McpTool[] }> {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] GET /mcp/tools`);
    return { tools: this.mcpService.getTools() };
  }

  @Post('tools/:name/execute')
  @HttpCode(200)
  async executeTool(@Req() req: Request, @Param('name') name: string, @Body() body: { params: any }) {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] POST /mcp/tools/${name}/execute`);
    return this.mcpService.executeTool(name, body.params || {}, tenantId);
  }
}

