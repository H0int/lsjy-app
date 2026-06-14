import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('automation_rules')
export class AutomationRule extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_auto_rules_event')
  event!: string;

  @Column({ type: 'json' })
  conditions!: Record<string, any>;

  @Column({ type: 'json' })
  actions!: Record<string, any>[];

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  @Index('idx_auto_rules_status')
  status!: string;

  @Column({ name: 'execution_count', type: 'int', unsigned: true, default: 0 })
  executionCount!: number;

  @Column({ name: 'last_executed_at', type: 'datetime', nullable: true })
  lastExecutedAt!: Date | null;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy!: number | null;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority!: number;
}
