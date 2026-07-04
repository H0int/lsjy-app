import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Course } from './course.entity';

@Entity('course_chapters')
export class CourseChapter extends BaseEntity {
  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: number;

  @ManyToOne(() => Course, (c) => c.chapters)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  parentId!: number | null;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_free_preview', type: 'tinyint', default: 0 })
  isFreePreview!: number;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds!: number;
}
