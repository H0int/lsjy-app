import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('content_moderation')
export class ContentModeration extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_mod_user')
  userId!: number;

  @Column({ type: 'enum', enum: ['post', 'comment', 'image', 'tool_output', 'profile', 'shop', 'product'], default: 'post' })
  contentType!: string;

  @Column({ name: 'content_id', type: 'bigint', unsigned: true })
  @Index('idx_mod_content')
  contentId!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title!: string | null;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'json', nullable: true })
  images!: string[] | null;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'flagged'], default: 'pending' })
  @Index('idx_mod_status')
  status!: string;

  @Column({ name: 'reviewed_by', type: 'bigint', unsigned: true, nullable: true })
  reviewedBy!: number | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'reject_reason', type: 'varchar', length: 500, nullable: true })
  rejectReason!: string | null;

  @Column({ name: 'ai_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiScore!: number | null;

  @Column({ name: 'flag_reason', type: 'varchar', length: 300, nullable: true })
  flagReason!: string | null;
}
