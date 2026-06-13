import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { ToolCategory } from './tool-category.entity';

@Entity('ai_tools')
export class AiTool extends SoftDeleteEntity {
  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  @Index('idx_ai_tools_category')
  categoryId!: number;

  @ManyToOne(() => ToolCategory, (cat) => cat.tools)
  @JoinColumn({ name: 'category_id' })
  category!: ToolCategory;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index('uk_ai_tools_slug')
  slug!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_ai_tools_provider')
  provider!: string;

  @Column({ name: 'model_id', type: 'varchar', length: 100 })
  modelId!: string;

  @Column({ name: 'tool_type', type: 'enum', enum: ['text', 'image', 'video', 'audio', 'analysis', 'other'] })
  @Index('idx_ai_tools_type')
  toolType!: string;

  @Column({ name: 'input_type', type: 'enum', enum: ['text', 'image', 'file', 'mixed'], default: 'text' })
  inputType!: string;

  @Column({ name: 'output_type', type: 'enum', enum: ['text', 'image', 'video', 'audio', 'file', 'mixed'], default: 'text' })
  outputType!: string;

  @Column({ name: 'coin_cost', type: 'int', unsigned: true })
  coinCost!: number;

  @Column({ name: 'max_input_length', type: 'int', default: 4000 })
  maxInputLength!: number;

  @Column({ name: 'max_output_length', type: 'int', default: 8000 })
  maxOutputLength!: number;

  @Column({ name: 'is_stream', type: 'tinyint', default: 1 })
  isStream!: number;

  @Column({ name: 'is_free', type: 'tinyint', default: 0 })
  isFree!: number;

  @Column({ name: 'free_daily_limit', type: 'int', default: 0 })
  freeDailyLimit!: number;

  @Column({ name: 'config_template', type: 'json', nullable: true })
  configTemplate!: Record<string, any> | null;

  @Column({ name: 'system_prompt', type: 'text', nullable: true })
  systemPrompt!: string | null;

  @Column({ type: 'json', nullable: true })
  parameters!: Record<string, any> | null;

  @Column({ name: 'usage_count', type: 'bigint', default: 0 })
  usageCount!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ['active', 'maintenance', 'disabled'], default: 'active' })
  @Index('idx_ai_tools_status')
  status!: string;
}
