import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';
import { PaymentModule } from '../payment/payment.module';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiCallRecord]), PaymentModule],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
