import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CoinConsumptionService } from './coin-consumption.service';
import { CoinAccount } from '../database/entities/coin-account.entity';
import { CoinRechargePackage } from '../database/entities/coin-recharge-package.entity';
import { CoinTransaction } from '../database/entities/coin-transaction.entity';
import { PaymentTransaction } from '../database/entities/payment-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoinAccount, CoinRechargePackage, CoinTransaction, PaymentTransaction])],
  controllers: [PaymentController],
  providers: [PaymentService, CoinConsumptionService],
  exports: [PaymentService, CoinConsumptionService],
})
export class PaymentModule {}
