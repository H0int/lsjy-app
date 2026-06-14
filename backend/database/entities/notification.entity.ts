import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_notifications_user')
  userId!: number;

  @Column({ type: 'enum', enum: ['system', 'order', 'payment', 'ai', 'edu', 'pet', 'campus', 'promotion'] })
  type!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'link_url', type: 'varchar', length: 500, nullable: true })
  linkUrl!: string | null;

  @Column({ name: 'extra_data', type: 'json', nullable: true })
  extraData!: Record<string, any> | null;

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead!: number;

  @Column({ name: 'read_at', type: 'datetime', nullable: true })
  readAt!: Date | null;
}
