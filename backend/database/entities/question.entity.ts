import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('question_bank')
export class Question extends BaseEntity {
  @Column({ name: 'course_id', type: 'bigint', unsigned: true, nullable: true })
  courseId!: number | null;

  @Column({ name: 'chapter_id', type: 'bigint', unsigned: true, nullable: true })
  chapterId!: number | null;

  @Column({ name: 'question_type', type: 'enum', enum: ['single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'essay'] })
  questionType!: string;

  @Column({ type: 'enum', enum: ['easy', 'medium', 'hard'], default: 'medium' })
  difficulty!: string;

  @Column({ name: 'question_text', type: 'text' })
  questionText!: string;

  @Column({ type: 'json', nullable: true })
  options!: Record<string, any> | null;

  @Column({ name: 'correct_answer', type: 'json' })
  correctAnswer!: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  explanation!: string | null;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 1.0 })
  score!: number;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount!: number;

  @Column({ name: 'correct_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  correctRate!: number | null;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy!: number | null;
}
