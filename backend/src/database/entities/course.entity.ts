import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SoftDeleteEntity } from './base.entity';
import { User } from './user.entity';
import { CourseChapter } from './course-chapter.entity';

@Entity('courses')
export class Course extends SoftDeleteEntity {
  @Column({ name: 'instructor_id', type: 'bigint', unsigned: true })
  instructorId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'instructor_id' })
  instructor!: User;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  categoryId!: number;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  subtitle!: string | null;

  @Column({ type: 'longtext', nullable: true })
  description!: string | null;

  @Column({ name: 'cover_image', type: 'varchar', length: 500 })
  coverImage!: string;

  @Column({ name: 'trailer_url', type: 'varchar', length: 500, nullable: true })
  trailerUrl!: string | null;

  @Column({ name: 'course_type', type: 'enum', enum: ['video', 'live', 'audio', 'document', 'mixed'] })
  courseType!: string;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' })
  difficulty!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ name: 'coin_price', type: 'int', unsigned: true, nullable: true })
  coinPrice!: number | null;

  @Column({ name: 'original_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice!: number | null;

  @Column({ name: 'total_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalHours!: number;

  @Column({ name: 'lesson_count', type: 'int', default: 0 })
  lessonCount!: number;

  @Column({ name: 'student_count', type: 'int', default: 0 })
  studentCount!: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating!: number;

  @Column({ type: 'json', nullable: true })
  tags!: string[] | null;

  @Column({ name: 'learning_objectives', type: 'text', nullable: true })
  learningObjectives!: string | null;

  @Column({ name: 'certificate_template', type: 'varchar', length: 500, nullable: true })
  certificateTemplate!: string | null;

  @Column({ name: 'is_published', type: 'tinyint', default: 0 })
  isPublished!: number;

  @Column({ type: 'enum', enum: ['draft', 'review', 'published', 'off_shelf', 'deleted'], default: 'draft' })
  status!: string;

  @OneToMany(() => CourseChapter, (ch) => ch.course)
  chapters!: CourseChapter[];
}
