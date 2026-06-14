/**
 * 图像生成 DTO
 */
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, MaxLength, Min, Max } from 'class-validator';

export class GenerateImageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  prompt!: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4)
  count?: number;

  @IsOptional()
  @IsEnum(['standard', 'hd'])
  quality?: 'standard' | 'hd';

  @IsOptional()
  @IsString()
  refImage?: string;
}

export class ImageResponseDto {
  urls!: string[];
  model!: string;
  provider!: string;
  durationMs!: number;
}
