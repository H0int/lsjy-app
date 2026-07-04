import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('faqs')
export class Faq extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  question!: string;

  @Column({ type: 'text' })
  answer!: string;

  @Column({ type: 'varchar', length: 50, default: 'general' })
  @Index('idx_faqs_category')
  category!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'view_count', type: 'int', unsigned: true, default: 0 })
  viewCount!: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;
}
