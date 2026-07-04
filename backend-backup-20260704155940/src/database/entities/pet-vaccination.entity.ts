import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Pet } from './pet.entity';

@Entity('pet_vaccinations')
export class PetVaccination extends BaseEntity {
  @Column({ name: 'pet_id', type: 'bigint', unsigned: true })
  petId!: number;

  @ManyToOne(() => Pet)
  @JoinColumn({ name: 'pet_id' })
  pet!: Pet;

  @Column({ name: 'vaccine_name', type: 'varchar', length: 100 })
  vaccineName!: string;

  @Column({ name: 'vaccine_type', type: 'varchar', length: 100, nullable: true })
  vaccineType!: string | null;

  @Column({ name: 'batch_no', type: 'varchar', length: 50, nullable: true })
  batchNo!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  manufacturer!: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  hospital!: string | null;

  @Column({ name: 'vaccinated_at', type: 'date' })
  vaccinatedAt!: string;

  @Column({ name: 'next_vaccine_at', type: 'date', nullable: true })
  nextVaccineAt!: string | null;

  @Column({ name: 'certificate_url', type: 'varchar', length: 500, nullable: true })
  certificateUrl!: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  remark!: string | null;
}
