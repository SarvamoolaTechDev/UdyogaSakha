import { Module } from '@nestjs/common';
import { EngagementsController } from './engagements.controller';
import { EngagementsService } from './engagements.service';
import { AuditModule } from '../audit/audit.module';
import { OpportunitiesModule } from '../opportunities/opportunities.module';

@Module({
  imports: [AuditModule, OpportunitiesModule],
  controllers: [EngagementsController],
  providers: [EngagementsService],
  exports: [EngagementsService],
})
export class EngagementsModule {}
