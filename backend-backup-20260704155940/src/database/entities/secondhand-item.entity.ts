import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Campus } from './campus.entity';

@Entity('secondhand_items')
export class SecondhandItem extends BaseEntity {
  @Column({ name: 'campus_id', type: 'bigint', unsigned: true })
  @Index('idx_secondhand_campus')
  campusId!: number;

  @ManyToOne(() => Campus)
  @JoinColumn({ name: 'campus_id' })
  campus!: Campus;

  @Column({ name: 'seller_id', type: 'bigint', unsigned: true })
  sellerId!: number;

  @Column({ name: 'buyer_id', type: 'bigint', unsigned: true, nullable: true })
  buyerId!: number | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'json' })
  images!: string[];

  @Column({ type: 'enum', enum: ['textbook', 'electronics', 'daily', 'clothing', 'sports', 'other'] })
  category!: string;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice!: number | null;

  @Column({ name: 'selling_price', type: 'decimal', precision: 10, scale: 2 })
  sellingPrice!: number;

  @Column({ name: 'condition_level', type: 'enum', enum: ['new', 'like_new', 'good', 'fair', 'poor'], default: 'good' })
  conditionLevel!: string;

  @Column({ name: 'contact_method', type: 'varchar', length: 200 })
  contactMethod!: string;

  @Column({ name: 'trade_method', type: 'enum', enum: ['face_to_face', 'shipping', 'both'], default: 'face_to_face' })
  tradeMethod!: string;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ name: 'want_count', type: 'int', default: 0 })
  wantCount!: number;

  @Column({ type: 'enum', enum: ['selling', 'reserved', 'sold', 'removed', 'expired'], default: 'selling' })
  status!: string;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true })
  expireAt!: Date | null;
}
