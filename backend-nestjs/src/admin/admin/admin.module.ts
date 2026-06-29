import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AiTool } from '../database/entities/ai-tool.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { CoinRechargePackage } from '../database/entities/coin-recharge-package.entity';
import { SensitiveWord } from '../entities/sensitive-word.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AiTool,
      AiCallRecord,
      CoinRechargePackage,
      SensitiveWord,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
