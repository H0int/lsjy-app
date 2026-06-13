import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('product_skus')
export class ProductSku extends BaseEntity {
  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  @Index('idx_sku_product')
  productId!: number;

  @ManyToOne(() => Product, (p) => p.skus)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'sku_code', type: 'varchar', length: 50, unique: true })
  skuCode!: string;

  @Column({ name: 'spec_values', type: 'json' })
  specValues!: Record<string, string>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice!: number | null;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice!: number | null;

  @Column({ type: 'int', unsigned: true })
  stock!: number;

  @Column({ name: 'locked_stock', type: 'int', unsigned: true, default: 0 })
  lockedStock!: number;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode!: string | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight!: number | null;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;
}
