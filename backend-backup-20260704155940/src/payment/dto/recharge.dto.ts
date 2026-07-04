import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RechargeDto {
  @ApiProperty({ description: '充值套餐ID' })
  @IsInt()
  @Min(1)
  packageId!: number;
}
