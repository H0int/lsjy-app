import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('learning_records')
@Unique('uk_learning_user_course', ['userId', 'courseId'])
export class LearningRecord extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: number;

  @Column({ name: 'lesson_id', type: 'bigint', unsigned: true, nullable: true })
  lessonId!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ name: 'current_position', type: 'int', default: 0 })
  currentPosition!: number;

  @Column({ name: 'total_seconds', type: 'int', default: 0 })
  totalSeconds!: number;

  @Column({ name: 'last_learn_at', type: 'datetime', nullable: true })
  lastLearnAt!: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'enum', enum: ['enrolled', 'learning', 'completed', 'dropped'], default: 'enrolled' })
  status!: string;
}
