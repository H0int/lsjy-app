import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { AiTool } from './ai-tool.entity';

@Entity('ai_call_records')
export class AiCallRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_ai_call_user_id')
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'tool_id', type: 'bigint', unsigned: true })
  @Index('idx_ai_call_tool_id')
  toolId!: number;

  @ManyToOne(() => AiTool)
  @JoinColumn({ name: 'tool_id' })
  tool!: AiTool;

  @Column({ name: 'request_id', type: 'varchar', length: 64, unique: true })
  @Index('uk_ai_call_request_id')
  requestId!: string;

  @Column({ name: 'input_text', type: 'text', nullable: true })
  inputText!: string | null;

  @Column({ name: 'input_params', type: 'json', nullable: true })
  inputParams!: Record<string, any> | null;

  @Column({ name: 'input_files', type: 'json', nullable: true })
  inputFiles!: string[] | null;

  @Column({ name: 'output_text', type: 'longtext', nullable: true })
  outputText!: string | null;

  @Column({ name: 'output_files', type: 'json', nullable: true })
  outputFiles!: string[] | null;

  @Column({ name: 'model_used', type: 'varchar', length: 100, nullable: true })
  modelUsed!: string | null;

  @Column({ name: 'tokens_input', type: 'int', default: 0 })
  tokensInput!: number;

  @Column({ name: 'tokens_output', type: 'int', default: 0 })
  tokensOutput!: number;

  @Column({ name: 'coin_cost', type: 'int', unsigned: true, default: 0 })
  coinCost!: number;

  @Column({ name: 'duration_ms', type: 'int', default: 0 })
  durationMs!: number;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], default: 'pending' })
  @Index('idx_ai_call_status')
  status!: string;

  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'is_favorite', type: 'tinyint', default: 0 })
  isFavorite!: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Index('idx_ai_call_user_tool')
  @Index('idx_ai_call_created_at')
  createdAt!: Date;
}
