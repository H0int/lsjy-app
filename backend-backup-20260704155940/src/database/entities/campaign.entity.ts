import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('campaigns')
export class Campaign extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage!: string | null;

  @Column({ type: 'enum', enum: ['promotion', 'event', 'launch', 'seasonal', 'collaboration'], default: 'promotion' })
  campaignType!: string;

  @Column({ name: 'start_at', type: 'datetime' })
  startAt!: Date;

  @Column({ name: 'end_at', type: 'datetime' })
  endAt!: Date;

  @Column({ type: 'json', nullable: true })
  config!: Record<string, any> | null;

  @Column({ name: 'target_users', type: 'enum', enum: ['all', 'new', 'vip', 'merchant'], default: 'all' })
  targetUsers!: string;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'enum', enum: ['draft', 'active', 'paused', 'ended'], default: 'draft' })
  @Index('idx_campaigns_status')
  status!: string;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy!: number | null;
}
