import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('coupons')
export class Coupon extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('uk_coupons_code')
  code!: string;

  @Column({ type: 'enum', enum: ['fixed', 'percent'], default: 'fixed' })
  discountType!: string;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue!: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minAmount!: number;

  @Column({ name: 'max_discount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscount!: number | null;

  @Column({ name: 'total_count', type: 'int', unsigned: true, default: 0 })
  totalCount!: number;

  @Column({ name: 'used_count', type: 'int', unsigned: true, default: 0 })
  usedCount!: number;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt!: Date;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ['active', 'paused', 'expired', 'exhausted'], default: 'active' })
  @Index('idx_coupons_status')
  status!: string;

  @Column({ name: 'applicable_scope', type: 'enum', enum: ['all', 'category', 'product', 'tool'], default: 'all' })
  applicableScope!: string;

  @Column({ name: 'applicable_ids', type: 'json', nullable: true })
  applicableIds!: number[] | null;
}
