import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    // Config — loads .env, available globally
    ConfigModule.forRoot({ isGlobal: true }),

    // Core
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

    // TODO Phase 2: PaymentsModule
    // TODO Phase 3: AnalyticsModule
  ],
})
export class AppModule {}
