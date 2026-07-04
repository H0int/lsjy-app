import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { User } from '../database/entities/user.entity';
import { Order } from '../database/entities/order.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';
import { AiCallRecord } from '../database/entities/ai-call-record.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order, CoinTransaction, AiCallRecord, PaymentTransaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
