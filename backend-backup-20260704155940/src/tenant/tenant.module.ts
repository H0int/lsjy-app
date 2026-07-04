import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantGuard } from './tenant.guard';

@Global()
@Module({
  imports: [JwtModule],
  providers: [TenantGuard],
  exports: [TenantGuard],
})
export class TenantModule {}
