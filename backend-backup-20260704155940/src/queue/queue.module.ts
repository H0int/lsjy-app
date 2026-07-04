
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { AiTasksProcessor } from './queue.processor';
import { NotificationProcessor } from './queue.processor';
import { DataProcessingProcessor } from './queue.processor';
import { EmailSendingProcessor } from './queue.processor';
import { ScheduledJobsProcessor } from './queue.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', '127.0.0.1'),
          port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
          password: configService.get('REDIS_PASSWORD', ''),
          db: parseInt(configService.get('REDIS_QUEUE_DB', '2'), 10),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'ai-tasks' },
      { name: 'notification' },
      { name: 'data-processing' },
      { name: 'email-sending' },
      { name: 'scheduled-jobs' },
    ),
  ],
  providers: [
    QueueService,
    AiTasksProcessor,
    NotificationProcessor,
    DataProcessingProcessor,
    EmailSendingProcessor,
    ScheduledJobsProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}

