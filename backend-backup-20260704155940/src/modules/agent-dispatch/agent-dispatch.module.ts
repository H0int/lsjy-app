import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentDispatchController } from './agent-dispatch.controller';
import { AgentDispatchService } from './agent-dispatch.service';

@Module({
  imports: [ConfigModule],
  controllers: [AgentDispatchController],
  providers: [AgentDispatchService],
  exports: [AgentDispatchService],
})
export class AgentDispatchModule {}
