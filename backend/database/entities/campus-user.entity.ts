import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('campus_users')
@Unique('uk_campus_user', ['campusId', 'userId'])
export class CampusUser extends BaseEntity {
  @Column({ name: 'campus_id', type: 'bigint', unsigned: true })
  campusId!: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ name: 'campus_role', type: 'enum', enum: ['admin', 'teacher', 'student', 'alumni', 'visitor'] })
  campusRole!: string;

  @Column({ name: 'student_id', type: 'varchar', length: 50, nullable: true })
  studentId!: string | null;

  @Column({ name: 'real_name', type: 'varchar', length: 50, nullable: true })
  realName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  grade!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  major!: string | null;

  @Column({ type: 'tinyint', default: 0 })
  verified!: number;
}
