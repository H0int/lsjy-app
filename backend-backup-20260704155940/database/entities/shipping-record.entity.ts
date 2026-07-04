import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('shipping_tracking')
export class ShippingRecord extends BaseEntity {
  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  @Index('idx_shipping_order')
  orderId!: number;

  @Column({ name: 'shipping_company', type: 'varchar', length: 50 })
  shippingCompany!: string;

  @Column({ name: 'shipping_code', type: 'varchar', length: 50 })
  shippingCode!: string;

  @Column({ name: 'tracking_no', type: 'varchar', length: 50 })
  trackingNo!: string;

  @Column({ type: 'enum', enum: ['shipped', 'in_transit', 'delivered', 'signed', 'exception'], default: 'shipped' })
  status!: string;

  @Column({ type: 'json', nullable: true })
  tracks!: Record<string, any>[] | null;

  @Column({ name: 'last_sync_at', type: 'datetime', nullable: true })
  lastSyncAt!: Date | null;
}
