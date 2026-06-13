import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @Column({ name: 'order_no', type: 'varchar', length: 32, unique: true })
  @Index('uk_orders_order_no')
  orderNo!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_orders_user')
  userId!: number;

  @Column({ name: 'shop_id', type: 'bigint', unsigned: true })
  @Index('idx_orders_shop')
  shopId!: number;

  @Column({ name: 'order_type', type: 'enum', enum: ['physical', 'virtual', 'service'], default: 'physical' })
  orderType!: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'freight_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  freightAmount!: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2 })
  payAmount!: number;

  @Column({ name: 'pay_method', type: 'enum', enum: ['coin', 'wechat', 'alipay', 'qq', 'mixed'], nullable: true })
  payMethod!: string | null;

  @Column({ name: 'coin_deducted', type: 'int', unsigned: true, default: 0 })
  coinDeducted!: number;

  @Column({ name: 'pay_at', type: 'datetime', nullable: true })
  payAt!: Date | null;

  @Column({ name: 'receiver_name', type: 'varchar', length: 50, nullable: true })
  receiverName!: string | null;

  @Column({ name: 'receiver_phone', type: 'varchar', length: 20, nullable: true })
  receiverPhone!: string | null;

  @Column({ name: 'receiver_address', type: 'varchar', length: 300, nullable: true })
  receiverAddress!: string | null;

  @Column({ name: 'shipping_company', type: 'varchar', length: 50, nullable: true })
  shippingCompany!: string | null;

  @Column({ name: 'shipping_no', type: 'varchar', length: 50, nullable: true })
  shippingNo!: string | null;

  @Column({ name: 'shipped_at', type: 'datetime', nullable: true })
  shippedAt!: Date | null;

  @Column({ name: 'received_at', type: 'datetime', nullable: true })
  receivedAt!: Date | null;

  @Column({ name: 'buyer_remark', type: 'varchar', length: 200, nullable: true })
  buyerRemark!: string | null;

  @Column({ type: 'enum', enum: ['pending_pay', 'paid', 'shipped', 'received', 'completed', 'cancelled', 'refunding', 'refunded', 'closed'], default: 'pending_pay' })
  @Index('idx_orders_status')
  status!: string;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true })
  expireAt!: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'cancel_reason', type: 'varchar', length: 200, nullable: true })
  cancelReason!: string | null;

  @OneToMany(() => OrderItem, (item) => item.order)
  items!: OrderItem[];
}
