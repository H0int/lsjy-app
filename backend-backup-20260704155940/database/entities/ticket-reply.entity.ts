import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ticket_replies')
export class TicketReply extends BaseEntity {
  @Column({ name: 'ticket_id', type: 'bigint', unsigned: true })
  @Index('idx_ticket_replies_ticket')
  ticketId!: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'is_admin', type: 'tinyint', default: 0 })
  isAdmin!: number;

  @Column({ type: 'json', nullable: true })
  attachments!: string[] | null;
}
