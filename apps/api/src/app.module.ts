import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    // Config — must be first, loaded globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Infrastructure — global singletons
    PrismaModule,
    AppConfigModule,

    // Ops
    HealthModule,

    // Core domain
    AuthModule,
    UsersModule,

    // Platform heart
    TrustModule,
    OpportunitiesModule,
    EngagementsModule,

    // Governance & oversight
    ModerationModule,
    GovernanceModule,

    // Cross-cutting
    NotificationsModule,
    AuditModule,

    // TODO Phase 2: PaymentsModule, SearchModule
    // TODO Phase 3: AnalyticsModule
  ],
})
export class AppModule {}
