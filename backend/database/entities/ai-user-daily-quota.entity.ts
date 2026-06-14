import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_user_daily_quota')
@Unique('uk_quota_user_tool_date', ['userId', 'toolId', 'usageDate'])
export class AiUserDailyQuota extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ name: 'tool_id', type: 'bigint', unsigned: true })
  toolId!: number;

  @Column({ name: 'usage_date', type: 'date' })
  usageDate!: string;

  @Column({ name: 'call_count', type: 'int', unsigned: true, default: 0 })
  callCount!: number;

  @Column({ name: 'coin_spent', type: 'int', unsigned: true, default: 0 })
  coinSpent!: number;
}
