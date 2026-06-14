import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('product_categories')
export class ProductCategory extends BaseEntity {
  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId!: number | null;

  @Column({ name: 'shop_id', type: 'bigint', unsigned: true, nullable: true })
  shopId!: number | null;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  icon!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'tinyint', default: 1 })
  level!: number;

  @Column({ name: 'is_visible', type: 'tinyint', default: 1 })
  isVisible!: number;
}
