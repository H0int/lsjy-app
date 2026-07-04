import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('coin_transactions')
export class CoinTransaction extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_coin_tx_user')
  userId!: number;

  @Column({ name: 'transaction_type', type: 'enum', enum: ['recharge', 'consume', 'refund', 'commission', 'bonus', 'admin_adjust', 'withdraw', 'transfer'] })
  @Index('idx_coin_tx_type')
  transactionType!: string;

  @Column({ type: 'bigint', comment: 'Positive=income, Negative=expense' })
  amount!: number;

  @Column({ name: 'balance_before', type: 'bigint', unsigned: true })
  balanceBefore!: number;

  @Column({ name: 'balance_after', type: 'bigint', unsigned: true })
  balanceAfter!: number;

  @Column({ name: 'ref_type', type: 'varchar', length: 50, nullable: true })
  refType!: string | null;

  @Column({ name: 'ref_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('idx_coin_tx_ref')
  refId!: number | null;

  @Column({ name: 'payment_transaction_id', type: 'bigint', unsigned: true, nullable: true })
  paymentTransactionId!: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  remark!: string | null;

  @Column({ name: 'operator_id', type: 'bigint', unsigned: true, nullable: true })
  operatorId!: number | null;
}
