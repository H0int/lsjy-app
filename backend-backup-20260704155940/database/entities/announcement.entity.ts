import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('announcements')
export class Announcement extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'enum', enum: ['info', 'warning', 'success', 'error'], default: 'info' })
  type!: string;

  @Column({ type: 'enum', enum: ['draft', 'published', 'archived'], default: 'draft' })
  @Index('idx_announcements_status')
  status!: string;

  @Column({ name: 'is_top', type: 'tinyint', default: 0 })
  isTop!: number;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'published_by', type: 'bigint', unsigned: true, nullable: true })
  publishedBy!: number | null;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true })
  expireAt!: Date | null;

  @Column({ name: 'view_count', type: 'int', unsigned: true, default: 0 })
  viewCount!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverImage!: string | null;
}
