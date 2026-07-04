import {
  Entity, Column, Index, ManyToMany, JoinTable,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 50 })
  displayName!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 0, comment: 'Level hierarchy, higher=more power' })
  level!: number;

  @Column({ name: 'is_system', type: 'tinyint', default: 0 })
  isSystem!: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;

  @ManyToMany(() => Permission, { eager: false })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions!: Permission[];
}
