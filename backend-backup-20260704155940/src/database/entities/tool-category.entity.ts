import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AiTool } from './ai-tool.entity';

@Entity('tool_categories')
export class ToolCategory extends BaseEntity {
  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId!: number | null;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  slug!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description!: string | null;

  @Column({ type: 'enum', enum: ['ai', 'media', 'shop', 'edu', 'pet', 'campus'], default: 'ai' })
  module!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_visible', type: 'tinyint', default: 1 })
  isVisible!: number;

  @Column({ name: 'tool_count', type: 'int', default: 0 })
  toolCount!: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;

  @OneToMany(() => AiTool, (tool) => tool.category)
  tools!: AiTool[];
}
