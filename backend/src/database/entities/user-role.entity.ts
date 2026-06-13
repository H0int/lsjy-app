import {
  Entity, Column, Index, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
@Unique('uk_user_role_scope', ['userId', 'roleId', 'scopeType', 'scopeId'])
export class UserRole extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  @Index('idx_user_roles_user_id')
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'role_id', type: 'bigint', unsigned: true })
  @Index('idx_user_roles_role_id')
  roleId!: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'scope_type', type: 'enum', enum: ['global', 'module', 'org'], default: 'global' })
  scopeType!: string;

  @Column({ name: 'scope_id', type: 'bigint', unsigned: true, nullable: true })
  scopeId!: number | null;

  @Column({ name: 'granted_by', type: 'bigint', unsigned: true, nullable: true })
  grantedBy!: number | null;

  @Column({ name: 'granted_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  grantedAt!: Date;

  @Column({ name: 'expire_at', type: 'timestamp', nullable: true })
  expireAt!: Date | null;
}
