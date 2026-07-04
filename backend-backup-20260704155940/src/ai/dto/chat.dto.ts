/**
 * 文本对话 DTO
 */
import { IsNotEmpty, IsArray, IsString, IsOptional, IsNumber, IsBoolean, IsEnum, ValidateNested, MaxLength, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsEnum(['system', 'user', 'assistant'])
  role!: 'system' | 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100000)
  content!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  @ArrayMaxSize(100)
  messages!: ChatMessageDto[];

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsNumber()
  topP?: number;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stop?: string[];
}

export class ChatResponseDto {
  content!: string;
  usage!: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model!: string;
  provider!: string;
  durationMs!: number;
  requestId?: string;
}
