import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { AppConfig } from './config/app.config';
import { DatabaseConfig } from './config/database.config';
import { AIConfig } from './config/ai.config';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AiToolsModule } from './ai-tools/ai-tools.module';
import { AIModule } from './ai/ai.module';
import { PaymentModule } from './payment/payment.module';
import { SystemModule } from './system/system.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { CouponsModule } from './coupons/coupons.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { TicketsModule } from './tickets/tickets.module';
import { FaqsModule } from './faqs/faqs.module';
import { AutomationModule } from './automation/automation.module';
import { ModerationModule } from './moderation/moderation.module';
import { ReportsModule } from './reports/reports.module';
import { VisitorsModule } from './visitors/visitors.module';
import { AgentDispatchModule } from './modules/agent-dispatch/agent-dispatch.module';
import { AdminExtrasController } from './admin-extras.controller';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig, AIConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'lsjy_saas'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 生产环境强制禁止自动同步表结构
        charset: 'utf8mb4',
        logging: configService.get<string>('NODE_ENV') === 'development',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
      }),
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    // Business Modules
    AuthModule,
    UsersModule,
    RolesModule,
    AiToolsModule,
    AIModule,
    PaymentModule,
    SystemModule,
    AnnouncementsModule,
    CouponsModule,
    CampaignsModule,
    TicketsModule,
    FaqsModule,
    AutomationModule,
    ModerationModule,
    ReportsModule,
    VisitorsModule,
    AgentDispatchModule,
    SkillsModule,
  ],
  controllers: [AdminExtrasController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
