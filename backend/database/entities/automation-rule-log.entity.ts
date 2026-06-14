import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('automation_rule_logs')
export class AutomationRuleLog extends BaseEntity {
  @Column({ name: 'rule_id', type: 'bigint', unsigned: true })
  @Index('idx_auto_logs_rule')
  ruleId!: number;

  @Column({ type: 'enum', enum: ['success', 'failed', 'skipped'], default: 'success' })
  status!: string;

  @Column({ name: 'trigger_data', type: 'json', nullable: true })
  triggerData!: Record<string, any> | null;

  @Column({ name: 'action_results', type: 'json', nullable: true })
  actionResults!: Record<string, any> | null;

  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
  errorMessage!: string | null;

  @Column({ name: 'duration_ms', type: 'int', default: 0 })
  durationMs!: number;
}
