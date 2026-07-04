import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('operation_logs')
export class OperationLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId!: number | null;

  @Column({ type: 'varchar', length: 50 })
  module!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50, nullable: true })
  targetType!: string | null;

  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: true })
  targetId!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ name: 'request_method', type: 'varchar', length: 10, nullable: true })
  requestMethod!: string | null;

  @Column({ name: 'request_url', type: 'varchar', length: 500, nullable: true })
  requestUrl!: string | null;

  @Column({ name: 'request_params', type: 'json', nullable: true })
  requestParams!: Record<string, any> | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress!: string | null;

  @Column({ type: 'enum', enum: ['success', 'failed'], default: 'success' })
  result!: string;

  @Column({ name: 'duration_ms', type: 'int', default: 0 })
  durationMs!: number;
}
