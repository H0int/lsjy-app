import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController, NotificationController } from './system.controller';
import { HealthController } from './health.controller';
import { SystemService } from './system.service';
import { SystemConfig } from '../database/entities/system-config.entity';
import { OperationLog } from '../database/entities/operation-log.entity';
import { Notification } from '../database/entities/notification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, OperationLog, Notification])],
  controllers: [SystemController, NotificationController, HealthController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
