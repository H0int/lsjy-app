
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

abstract class BaseTenantProcessor extends WorkerHost {
  protected readonly logger: Logger;

  constructor(name: string) {
    super();
    this.logger = new Logger(name);
  }

  protected validateTenant(job: Job): void {
    const tenantId = job.data?.tenantId;
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      throw new Error(`Job ${job.id} rejected: missing tenantId`);
    }
    this.logger.debug(`Processing job ${job.id} for tenant ${tenantId}`);
  }
}

@Processor('ai-tasks')
export class AiTasksProcessor extends BaseTenantProcessor {
  constructor() { super('AiTasksProcessor'); }

  async process(job: Job): Promise<any> {
    this.validateTenant(job);
    this.logger.log(`[tenant:${job.data.tenantId}] Processing AI task: ${job.name}`);
    // TODO: Implement actual AI task processing
    return { status: 'completed', tenantId: job.data.tenantId };
  }
}

@Processor('notification')
export class NotificationProcessor extends BaseTenantProcessor {
  constructor() { super('NotificationProcessor'); }

  async process(job: Job): Promise<any> {
    this.validateTenant(job);
    this.logger.log(`[tenant:${job.data.tenantId}] Processing notification: ${job.name}`);
    return { status: 'completed', tenantId: job.data.tenantId };
  }
}

@Processor('data-processing')
export class DataProcessingProcessor extends BaseTenantProcessor {
  constructor() { super('DataProcessingProcessor'); }

  async process(job: Job): Promise<any> {
    this.validateTenant(job);
    this.logger.log(`[tenant:${job.data.tenantId}] Processing data task: ${job.name}`);
    return { status: 'completed', tenantId: job.data.tenantId };
  }
}

@Processor('email-sending')
export class EmailSendingProcessor extends BaseTenantProcessor {
  constructor() { super('EmailSendingProcessor'); }

  async process(job: Job): Promise<any> {
    this.validateTenant(job);
    this.logger.log(`[tenant:${job.data.tenantId}] Sending email: ${job.name}`);
    return { status: 'completed', tenantId: job.data.tenantId };
  }
}

@Processor('scheduled-jobs')
export class ScheduledJobsProcessor extends BaseTenantProcessor {
  constructor() { super('ScheduledJobsProcessor'); }

  async process(job: Job): Promise<any> {
    this.validateTenant(job);
    this.logger.log(`[tenant:${job.data.tenantId}] Running scheduled job: ${job.name}`);
    return { status: 'completed', tenantId: job.data.tenantId };
  }
}

