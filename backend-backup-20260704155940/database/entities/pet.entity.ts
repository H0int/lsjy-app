import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('pets')
export class Pet extends BaseEntity {
  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  owner!: User;

  @Column({ type: 'varchar', length: 50 })
  name!: string;

  @Column({ type: 'enum', enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'] })
  species!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed!: string | null;

  @Column({ type: 'enum', enum: ['male', 'female', 'unknown'], default: 'unknown' })
  gender!: string;

  @Column({ name: 'birthday', type: 'date', nullable: true })
  birthday!: Date | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight!: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string | null;

  @Column({ name: 'microchip_no', type: 'varchar', length: 50, nullable: true })
  microchipNo!: string | null;

  @Column({ name: 'is_neutered', type: 'tinyint', default: 0 })
  isNeutered!: number;

  @Column({ name: 'allergy_info', type: 'json', nullable: true })
  allergyInfo!: Record<string, any> | null;

  @Column({ name: 'character_traits', type: 'json', nullable: true })
  characterTraits!: string[] | null;

  @Column({ type: 'enum', enum: ['alive', 'deceased', 'adopted'], default: 'alive' })
  status!: string;
}
