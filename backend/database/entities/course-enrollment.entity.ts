import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('course_enrollments')
@Unique('uk_enrollment_user_course', ['userId', 'courseId'])
export class CourseEnrollment extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ name: 'course_id', type: 'bigint', unsigned: true })
  courseId!: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId!: number | null;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  payAmount!: number;

  @Column({ name: 'pay_method', type: 'enum', enum: ['free', 'coin', 'wechat', 'alipay'], default: 'free' })
  payMethod!: string;

  @Column({ name: 'expire_at', type: 'datetime', nullable: true })
  expireAt!: Date | null;

  @Column({ type: 'enum', enum: ['active', 'expired', 'refunded'], default: 'active' })
  status!: string;

  @Column({ name: 'enrolled_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  enrolledAt!: Date;
}
