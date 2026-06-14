/**
 * AI Module - 注册所有AI相关组件
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { AIProviderManager } from './providers/provider-manager';
import { AiProvider } from './entities/ai-provider.entity';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { AiUserDailyQuota } from '../database/entities/ai-user-daily-quota.entity';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiProvider,
      AiTool,
      AiCallRecord,
      AiUserDailyQuota,
      CoinAccount,
      CoinTransaction,
    ]),
  ],
  controllers: [AIController],
  providers: [AIService, AIProviderManager],
  exports: [AIService, AIProviderManager],
})
export class AIModule {}
