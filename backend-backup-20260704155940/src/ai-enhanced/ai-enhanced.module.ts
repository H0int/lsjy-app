import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiEnhancedService } from './ai-enhanced.service';
import { AiEnhancedController } from './ai-enhanced.controller';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../queue/queue.module';
import { AiGuard } from './ai-guard.middleware';

@Module({
  imports: [ConfigModule, AuthModule, QueueModule],
  providers: [AiEnhancedService, AiGuard],
  controllers: [AiEnhancedController],
  exports: [AiEnhancedService],
})
export class AiEnhancedModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // AiGuard is applied as route middleware in the controller via @UseGuards
  }
}
