import {
  Entity, Column, Index,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('login_logs')
export class LoginLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('idx_login_logs_user_id')
  userId!: number | null;

  @Column({ name: 'login_type', type: 'enum', enum: ['password', 'sms', 'oauth', 'wechat', 'qq'] })
  loginType!: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  @Index('idx_login_logs_ip')
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent!: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 50, nullable: true })
  deviceType!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location!: string | null;

  @Column({ type: 'enum', enum: ['success', 'failed', 'locked'] })
  status!: string;

  @Column({ name: 'fail_reason', type: 'varchar', length: 200, nullable: true })
  failReason!: string | null;
}
