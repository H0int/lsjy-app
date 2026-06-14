import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('tickets')
export class Ticket extends BaseEntity {
  @Column({ type: 'varchar', length: 32, unique: true })
  @Index('uk_tickets_no')
  ticketNo!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_tickets_user')
  userId!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: ['general', 'bug', 'feature', 'billing', 'account', 'other'], default: 'general' })
  category!: string;

  @Column({ name: 'priority', type: 'enum', enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' })
  priority!: string;

  @Column({ type: 'enum', enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'], default: 'open' })
  @Index('idx_tickets_status')
  status!: string;

  @Column({ name: 'assigned_to', type: 'bigint', unsigned: true, nullable: true })
  assignedTo!: number | null;

  @Column({ name: 'resolved_at', type: 'datetime', nullable: true })
  resolvedAt!: Date | null;

  @Column({ name: 'resolved_by', type: 'bigint', unsigned: true, nullable: true })
  resolvedBy!: number | null;
}
