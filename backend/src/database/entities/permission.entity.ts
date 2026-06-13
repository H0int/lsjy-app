import {
  Entity, Column, Index, ManyToOne, JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: true })
  @Index('idx_permissions_parent')
  parentId!: number | null;

  @ManyToOne(() => Permission, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: Permission | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index('uk_permissions_name')
  name!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName!: string;

  @Column({ type: 'varchar', length: 50 })
  @Index('idx_permissions_module')
  module!: string;

  @Column({ type: 'enum', enum: ['menu', 'button', 'api'] })
  type!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  path!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'enum', enum: ['active', 'disabled'], default: 'active' })
  status!: string;
}
