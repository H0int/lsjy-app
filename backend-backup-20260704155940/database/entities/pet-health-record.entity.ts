import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Pet } from './pet.entity';

@Entity('pet_health_records')
export class PetHealthRecord extends BaseEntity {
  @Column({ name: 'pet_id', type: 'bigint', unsigned: true })
  petId!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @Column({ name: 'record_type', type: 'enum', enum: ['checkup', 'symptom', 'treatment', 'medication', 'surgery', 'daily'] })
  recordType!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'hospital_name', type: 'varchar', length: 200, nullable: true })
  hospitalName!: string | null;

  @Column({ name: 'doctor_name', type: 'varchar', length: 100, nullable: true })
  doctorName!: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weight!: number | null;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  diagnosis!: string | null;

  @Column({ type: 'text', nullable: true })
  prescription!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost!: number | null;

  @Column({ type: 'json', nullable: true })
  attachments!: string[] | null;

  @Column({ name: 'next_visit_date', type: 'date', nullable: true })
  nextVisitDate!: Date | null;

  @Column({ name: 'record_date', type: 'date' })
  recordDate!: string;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy!: number | null;
}
