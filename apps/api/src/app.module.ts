import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from './config/app-config.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting: 60 req/min per IP globally
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AppConfigModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TrustModule,
    OpportunitiesModule,
    EngagementsModule,
    ModerationModule,
    GovernanceModule,
    NotificationsModule,
    AuditModule,
    QueueModule,
    SearchModule,
    AnalyticsModule,
    // TODO Phase 2: PaymentsModule
  ],
})
export class AppModule {}
