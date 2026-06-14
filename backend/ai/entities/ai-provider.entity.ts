/**
 * AI Provider 配置实体
 * 存储各AI服务商的配置信息（API Key加密存储）
 */
import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../database/entities/base.entity';

@Entity('ai_providers')
export class AiProvider extends BaseEntity {
  @Column({ type: 'varchar', length: 50, unique: true })
  @Index('uk_ai_providers_name')
  name!: string;

  @Column({ name: 'display_name', type: 'varchar', length: 100 })
  displayName!: string;

  @Column({ name: 'api_key_encrypted', type: 'varchar', length: 500, nullable: true })
  apiKeyEncrypted!: string | null;

  @Column({ name: 'base_url', type: 'varchar', length: 200, nullable: true })
  baseUrl!: string | null;

  @Column({ name: 'default_model', type: 'varchar', length: 100, nullable: true })
  defaultModel!: string | null;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'error'], default: 'active' })
  @Index('idx_ai_providers_status')
  status!: string;

  @Column({ name: 'rate_limit', type: 'int', unsigned: true, default: 60 })
  rateLimit!: number;

  @Column({ type: 'int', default: 0 })
  priority!: number;

  @Column({ type: 'json', nullable: true })
  config!: Record<string, any> | null;

  @Column({ name: 'total_calls', type: 'bigint', unsigned: true, default: 0 })
  totalCalls!: number;

  @Column({ name: 'total_tokens', type: 'bigint', unsigned: true, default: 0 })
  totalTokens!: number;

  @Column({ name: 'total_cost_points', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalCostPoints!: number;

  @Column({ name: 'last_error', type: 'varchar', length: 500, nullable: true })
  lastError!: string | null;

  @Column({ name: 'last_health_check', type: 'timestamp', nullable: true })
  lastHealthCheck!: Date | null;
}
