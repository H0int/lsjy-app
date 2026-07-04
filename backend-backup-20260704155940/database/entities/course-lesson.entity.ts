import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CourseChapter } from './course-chapter.entity';
import { Course } from './course.entity';

@Entity('course_lessons')
export class CourseLesson extends BaseEntity {
  @Column({ name: 'chapter_id', type: 'bigint', unsigned: true })
  chapterId!: number;

  @ManyToOne(() => CourseChapter)
  @JoinColumn({ name: 'chapter_id' })
  chapter!: CourseChapter;

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: number;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'content_type', type: 'enum', enum: ['video', 'audio', 'document', 'live', 'quiz'] })
  contentType!: string;

  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl!: string | null;

  @Column({ name: 'audio_url', type: 'varchar', length: 500, nullable: true })
  audioUrl!: string | null;

  @Column({ name: 'document_url', type: 'varchar', length: 500, nullable: true })
  documentUrl!: string | null;

  @Column({ name: 'live_room_id', type: 'varchar', length: 100, nullable: true })
  liveRoomId!: string | null;

  @Column({ name: 'live_start_at', type: 'datetime', nullable: true })
  liveStartAt!: Date | null;

  @Column({ name: 'content_text', type: 'longtext', nullable: true })
  contentText!: string | null;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds!: number;

  @Column({ name: 'file_size', type: 'bigint', default: 0 })
  fileSize!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_free_preview', type: 'tinyint', default: 0 })
  isFreePreview!: number;

  @Column({ type: 'enum', enum: ['draft', 'published', 'disabled'], default: 'draft' })
  status!: string;
}
