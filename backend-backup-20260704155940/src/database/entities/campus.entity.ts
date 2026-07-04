import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('campuses')
export class Campus extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('uk_campuses_code')
  code!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo!: string | null;

  @Column({ type: 'varchar', length: 50 })
  province!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  address!: string | null;

  @Column({ name: 'school_type', type: 'enum', enum: ['university', 'college', 'vocational', 'high_school'] })
  schoolType!: string;

  @Column({ name: 'student_count', type: 'int', default: 0 })
  studentCount!: number;

  @Column({ name: 'admin_user_id', type: 'bigint', unsigned: true, nullable: true })
  adminUserId!: number | null;

  @Column({ type: 'enum', enum: ['active', 'pending', 'suspended'], default: 'pending' })
  status!: string;
}
