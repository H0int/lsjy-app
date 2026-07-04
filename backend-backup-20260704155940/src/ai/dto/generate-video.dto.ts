import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateVideoDto {
  @ApiProperty({ description: '视频描述提示词' })
  @IsString()
  prompt: string;

  @ApiPropertyOptional({ description: '视频时长（秒）', default: 5 })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({ description: '分辨率', enum: ['720p', '1080p'], default: '720p' })
  @IsOptional()
  @IsIn(['720p', '1080p'])
  resolution?: string;

  @ApiPropertyOptional({ description: '视频风格', enum: ['tech', 'business', 'energetic', 'minimal', 'default'] })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiPropertyOptional({ description: '渲染引擎', enum: ['kling', 'remotion', 'hyperframes'] })
  @IsOptional()
  @IsString()
  engine?: string;

  @ApiPropertyOptional({ description: '参考图片URL' })
  @IsOptional()
  @IsString()
  refImage?: string;
}
