import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
import { LoggerModule } from './common/logger/logger.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { SanitizeMiddleware } from './common/middleware/sanitize.middleware';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TrustModule } from './modules/trust/trust.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { EngagementsModule } from './modules/engagements/engagements.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { GovernanceModule } from './modules/governance/governance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { QueueModule } from './modules/queue/queue.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    // Infrastructure
    PrismaModule,
    AppConfigModule,
    LoggerModule,

    // Ops
    HealthModule,
    SchedulerModule,

    // Core domain
    AuthModule,
    UsersModule,
    TrustModule,
    OpportunitiesModule,
    EngagementsModule,

    // Governance & oversight
    ModerationModule,
    GovernanceModule,

    // Cross-cutting
    NotificationsModule,
    AuditModule,

    // Infrastructure services
    QueueModule,
    SearchModule,
    AnalyticsModule,
    DocumentsModule,

    // TODO Phase 2: PaymentsModule
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, SanitizeMiddleware)
      .forRoutes('*');
  }
}
