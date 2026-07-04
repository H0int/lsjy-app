import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { Shop } from './shop.entity';
import { ProductSku } from './product-sku.entity';

@Entity('products')
export class Product extends SoftDeleteEntity {
  @Column({ name: 'shop_id', type: 'bigint', unsigned: true })
  @Index('idx_products_shop')
  shopId!: number;

  @ManyToOne(() => Shop, (s) => s.products)
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  @Index('idx_products_category')
  categoryId!: number;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  subtitle!: string | null;

  @Column({ type: 'longtext', nullable: true })
  description!: string | null;

  @Column({ name: 'main_images', type: 'json' })
  mainImages!: string[];

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl!: string | null;

  @Column({ name: 'price_min', type: 'decimal', precision: 10, scale: 2 })
  @Index('idx_products_price')
  priceMin!: number;

  @Column({ name: 'price_max', type: 'decimal', precision: 10, scale: 2 })
  priceMax!: number;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice!: number | null;

  @Column({ name: 'total_stock', type: 'int', default: 0 })
  totalStock!: number;

  @Column({ name: 'total_sales', type: 'int', default: 0 })
  @Index('idx_products_sales')
  totalSales!: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight!: number | null;

  @Column({ name: 'freight_template_id', type: 'bigint', unsigned: true, nullable: true })
  freightTemplateId!: number | null;

  @Column({ name: 'is_virtual', type: 'tinyint', default: 0 })
  isVirtual!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ['draft', 'active', 'sold_out', 'off_shelf', 'deleted'], default: 'draft' })
  @Index('idx_products_status')
  status!: string;

  @OneToMany(() => ProductSku, (sku) => sku.product)
  skus!: ProductSku[];
}
