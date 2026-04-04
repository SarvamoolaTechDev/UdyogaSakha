import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuditModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
