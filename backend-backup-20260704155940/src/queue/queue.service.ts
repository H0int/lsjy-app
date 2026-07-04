
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface TenantJobData {
  tenantId: string;
  [key: string]: any;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('ai-tasks') private readonly aiTasksQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('data-processing') private readonly dataProcessingQueue: Queue,
    @InjectQueue('email-sending') private readonly emailSendingQueue: Queue,
    @InjectQueue('scheduled-jobs') private readonly scheduledJobsQueue: Queue,
  ) {}

  private validateTenantId(data: TenantJobData): void {
    if (!data.tenantId || typeof data.tenantId !== 'string' || data.tenantId.trim() === '') {
      throw new BadRequestException('tenantId is required for all queue jobs');
    }
  }

  private getQueue(queueName: string): Queue {
    const queues: Record<string, Queue> = {
      'ai-tasks': this.aiTasksQueue,
      'notification': this.notificationQueue,
      'data-processing': this.dataProcessingQueue,
      'email-sending': this.emailSendingQueue,
      'scheduled-jobs': this.scheduledJobsQueue,
    };
    return queues[queueName];
  }

  async addJob(queueName: string, jobName: string, data: TenantJobData, opts?: any) {
    this.validateTenantId(data);
    const queue = this.getQueue(queueName);
    if (!queue) {
      throw new BadRequestException(`Unknown queue: ${queueName}`);
    }
    const job = await queue.add(jobName, data, opts);
    this.logger.log(`Job ${job.id} added to ${queueName} for tenant ${data.tenantId}`);
    return job;
  }

  async getQueueStats() {
    const queueNames = ['ai-tasks', 'notification', 'data-processing', 'email-sending', 'scheduled-jobs'];
    const stats: any = {};
    for (const name of queueNames) {
      const q = this.getQueue(name);
      const [waiting, active, completed, failed] = await Promise.all([
        q.getWaitingCount(), q.getActiveCount(), q.getCompletedCount(), q.getFailedCount(),
      ]);
      stats[name] = { waiting, active, completed, failed };
    }
    return stats;
  }
}

