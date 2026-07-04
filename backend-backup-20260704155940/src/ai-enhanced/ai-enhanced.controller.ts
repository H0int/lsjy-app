
import { Controller, Post, Get, Body, Param, Req, UseGuards, HttpCode, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AiEnhancedService } from './ai-enhanced.service';
import { QueueService } from '../queue/queue.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ai-enhanced')
@UseGuards(AuthGuard('jwt'))
export class AiEnhancedController {
  private readonly logger = new Logger(AiEnhancedController.name);

  constructor(
    private readonly aiService: AiEnhancedService,
    private readonly queueService: QueueService,
  ) {}

  private getTenantId(req: any): string {
    // Extract tenant from JWT payload
    const tenantId = req.user?.tenantId || req.user?.id || req.user?.sub;
    if (!tenantId) {
      throw new Error('Tenant context not found in request');
    }
    return String(tenantId);
  }

  @Post('generate')
  @HttpCode(200)
  async generate(@Req() req: Request, @Body() body: { provider: string; model: string; prompt: string }) {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] POST /ai-enhanced/generate`);
    return this.aiService.generate(body.provider, body.model, body.prompt, tenantId);
  }

  @Post('langchain')
  @HttpCode(200)
  async langchain(@Req() req: Request, @Body() body: { model: string; prompt: string }) {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] POST /ai-enhanced/langchain`);
    return this.aiService.langchainProcess(body.model, body.prompt, tenantId);
  }

  @Post('queue')
  @HttpCode(201)
  async queueJob(@Req() req: Request, @Body() body: { queueName: string; jobName: string; data: any; opts?: any }) {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] POST /ai-enhanced/queue -> ${body.queueName}`);
    // Force tenantId into job data
    const dataWithTenant = { ...body.data, tenantId };
    return this.queueService.addJob(body.queueName, body.jobName, dataWithTenant, body.opts);
  }

  @Get('providers')
  async getProviders(@Req() req: Request) {
    const tenantId = this.getTenantId(req);
    this.logger.log(`[${tenantId}] GET /ai-enhanced/providers`);
    return { providers: this.aiService.getAvailableProviders() };
  }
}

