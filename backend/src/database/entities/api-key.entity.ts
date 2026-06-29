import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @Column({ name: 'key_hash', length: 128 })
  keyHash: string;

  @Column({ name: 'key_prefix', length: 16 })
  keyPrefix: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ name: 'rate_limit', default: 60 })
  rateLimit: number;

  @Column({ name: 'ip_whitelist', type: 'json', nullable: true })
  ipWhitelist: string[];

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'last_used_at', type: 'datetime', nullable: true })
  lastUsedAt: Date;

  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
