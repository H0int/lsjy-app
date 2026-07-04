import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('system_configs')
export class SystemConfig extends BaseEntity {
  @Column({ name: 'config_group', type: 'varchar', length: 50 })
  configGroup!: string;

  @Column({ name: 'config_key', type: 'varchar', length: 100, unique: true })
  @Index('uk_system_configs_key')
  configKey!: string;

  @Column({ name: 'config_value', type: 'text', nullable: true })
  configValue!: string | null;

  @Column({ name: 'config_type', type: 'enum', enum: ['string', 'number', 'boolean', 'json', 'file'], default: 'string' })
  configType!: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description!: string | null;

  @Column({ name: 'is_public', type: 'tinyint', default: 0 })
  isPublic!: number;

  @Column({ name: 'updated_by', type: 'bigint', unsigned: true, nullable: true })
  updatedBy!: number | null;
}
