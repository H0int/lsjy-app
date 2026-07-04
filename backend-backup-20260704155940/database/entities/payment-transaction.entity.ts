import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('payment_transactions')
export class PaymentTransaction extends BaseEntity {
  @Column({ name: 'transaction_no', type: 'varchar', length: 64, unique: true })
  @Index('uk_transaction_no')
  transactionNo!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_payment_user')
  userId!: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('idx_payment_order')
  orderId!: number | null;

  @Column({ name: 'biz_type', type: 'enum', enum: ['order_pay', 'recharge', 'refund', 'commission', 'withdraw'] })
  bizType!: string;

  @Column({ name: 'pay_channel', type: 'enum', enum: ['coin', 'wechat', 'alipay', 'qq'] })
  payChannel!: string;

  @Column({ name: 'channel_trade_no', type: 'varchar', length: 100, nullable: true })
  channelTradeNo!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ name: 'coin_amount', type: 'int', unsigned: true, default: 0 })
  coinAmount!: number;

  @Column({ type: 'enum', enum: ['in', 'out'] })
  direction!: string;

  @Column({ type: 'enum', enum: ['pending', 'success', 'failed', 'refunded'] })
  @Index('idx_payment_status')
  status!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  remark!: string | null;

  @Column({ name: 'callback_data', type: 'json', nullable: true })
  callbackData!: Record<string, any> | null;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt!: Date | null;
}
