import { Module } from '@nestjs/common';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';
import { AuditModule } from '../audit/audit.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuditModule, UsersModule],
  controllers: [TrustController],
  providers: [TrustService],
  exports: [TrustService],
})
export class TrustModule {}
