import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiToolsController } from './ai-tools.controller';
import { AiToolsService } from './ai-tools.service';
import { ToolCategory } from '../database/entities/tool-category.entity';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { AiUserDailyQuota } from '../database/entities/ai-user-daily-quota.entity';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ToolCategory, AiTool, AiCallRecord, AiUserDailyQuota, CoinAccount, CoinTransaction])],
  controllers: [AiToolsController],
  providers: [AiToolsService],
  exports: [AiToolsService],
})
export class AiToolsModule {}
