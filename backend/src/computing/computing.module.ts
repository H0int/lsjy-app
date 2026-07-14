import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComputingController } from './computing.controller';
import { ComputingService } from './computing.service';
import { ComputingDispatchConfig, VirtualEmployee, ComputingDispatchLog, ValueAddedPackage, ValueAddedOrder } from '../database/entities/computing-entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComputingDispatchConfig, VirtualEmployee, ComputingDispatchLog, ValueAddedPackage, ValueAddedOrder])],
  controllers: [ComputingController],
  providers: [ComputingService],
  exports: [ComputingService],
})
export class ComputingModule {}
