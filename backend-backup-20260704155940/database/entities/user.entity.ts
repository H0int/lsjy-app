import {
  Entity, Column, Index, OneToMany,
} from 'typeorm';
import { SoftDeleteEntity } from './base.entity';

@Entity('users')
export class User extends SoftDeleteEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('uk_users_username')
  username!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 50 })
  nickname!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string | null;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @Index('uk_users_phone')
  phone!: string | null;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  @Index('uk_users_email')
  email!: string | null;

  @Column({ name: 'phone_verified', type: 'tinyint', default: 0 })
  phoneVerified!: number;

  @Column({ name: 'email_verified', type: 'tinyint', default: 0 })
  emailVerified!: number;

  @Column({ type: 'tinyint', default: 0, comment: '0=unknown,1=male,2=female' })
  gender!: number;

  @Column({ type: 'date', nullable: true })
  birthday!: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  bio!: string | null;

  @Column({ name: 'user_type', type: 'enum', enum: ['personal', 'merchant', 'enterprise'], default: 'personal' })
  @Index('idx_users_user_type')
  userType!: string;

  @Column({ name: 'vip_level', type: 'tinyint', default: 0 })
  vipLevel!: number;

  @Column({ name: 'vip_expire_at', type: 'datetime', nullable: true })
  vipExpireAt!: Date | null;

  @Column({ type: 'enum', enum: ['pending', 'active', 'frozen', 'banned'], default: 'pending' })
  @Index('idx_users_status')
  status!: string;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
  lastLoginIp!: string | null;
}
