import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { AutomationRule } from '../database/entities/automation-rule.entity';
import { AutomationRuleLog } from '../database/entities/automation-rule-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AutomationRule, AutomationRuleLog])],
  controllers: [AutomationController],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
