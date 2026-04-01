import { Module } from '@nestjs/common';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { TrustModule } from '../trust/trust.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TrustModule, AuditModule],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
