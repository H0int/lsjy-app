import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { ContentModeration } from '../database/entities/content-moderation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentModeration])],
  controllers: [ModerationController],
  providers: [ModerationService],
  exports: [ModerationService],
})
export class ModerationModule {}
