import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('shops')
export class Shop extends SoftDeleteEntity {
  @Column({ name: 'owner_id', type: 'bigint', unsigned: true })
  ownerId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'cover_image', type: 'varchar', length: 500, nullable: true })
  coverImage!: string | null;

  @Column({ name: 'shop_type', type: 'enum', enum: ['individual', 'enterprise'], default: 'individual' })
  shopType!: string;

  @Column({ name: 'business_license', type: 'varchar', length: 500, nullable: true })
  businessLicense!: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  province!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address!: string | null;

  @Column({ name: 'decoration_config', type: 'json', nullable: true })
  decorationConfig!: Record<string, any> | null;

  @Column({ name: 'product_count', type: 'int', default: 0 })
  productCount!: number;

  @Column({ name: 'order_count', type: 'int', default: 0 })
  orderCount!: number;

  @Column({ name: 'total_sales', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSales!: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 5.0 })
  rating!: number;

  @Column({ type: 'enum', enum: ['pending', 'active', 'suspended', 'closed'], default: 'pending' })
  status!: string;

  @OneToMany(() => Product, (p) => p.shop)
  products!: Product[];
}
