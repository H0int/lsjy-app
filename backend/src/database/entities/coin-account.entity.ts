import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('coin_accounts')
export class CoinAccount extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, unique: true })
  @Index('uk_coin_accounts_user_id')
  userId!: number;

  @Column({ type: 'bigint', unsigned: true, default: 0 })
  balance!: number;

  @Column({ name: 'frozen_amount', type: 'bigint', unsigned: true, default: 0 })
  frozenAmount!: number;

  @Column({ name: 'total_recharge', type: 'bigint', unsigned: true, default: 0 })
  totalRecharge!: number;

  @Column({ name: 'total_consumed', type: 'bigint', unsigned: true, default: 0 })
  totalConsumed!: number;

  @Column({ name: 'total_earned', type: 'bigint', unsigned: true, default: 0 })
  totalEarned!: number;

  @Column({ name: 'total_withdrawn', type: 'bigint', unsigned: true, default: 0 })
  totalWithdrawn!: number;

  @Column({ type: 'int', unsigned: true, default: 0, version: true })
  version!: number;

  @Column({ type: 'enum', enum: ['active', 'frozen', 'closed'], default: 'active' })
  status!: string;
}
