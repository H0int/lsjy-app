import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('coin_recharge_packages')
export class CoinRechargePackage extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'coin_amount', type: 'int', unsigned: true })
  coinAmount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice!: number | null;

  @Column({ name: 'bonus_coins', type: 'int', unsigned: true, default: 0 })
  bonusCoins!: number;

  @Column({ name: 'is_recommended', type: 'tinyint', default: 0 })
  isRecommended!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;
}
