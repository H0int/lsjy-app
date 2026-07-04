import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Campus } from './campus.entity';
import { User } from './user.entity';

@Entity('clubs')
export class Club extends BaseEntity {
  @Column({ name: 'campus_id', type: 'bigint', unsigned: true })
  campusId!: number;

  @ManyToOne(() => Campus)
  @JoinColumn({ name: 'campus_id' })
  campus!: Campus;

  @Column({ name: 'president_id', type: 'bigint', unsigned: true })
  presidentId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'president_id' })
  president!: User;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'cover_image', type: 'varchar', length: 500, nullable: true })
  coverImage!: string | null;

  @Column({ type: 'enum', enum: ['academic', 'sports', 'art', 'tech', 'volunteer', 'other'] })
  category!: string;

  @Column({ name: 'member_count', type: 'int', default: 0 })
  memberCount!: number;

  @Column({ name: 'join_type', type: 'enum', enum: ['free', 'apply', 'invite'], default: 'free' })
  joinType!: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'dissolved'], default: 'active' })
  status!: string;
}
