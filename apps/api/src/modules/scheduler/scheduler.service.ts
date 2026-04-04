import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditEntityType } from '@udyogasakha/types';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * OPPORTUNITY EXPIRY — runs every hour.
   * Auto-closes published opportunities where closesAt has passed.
   */
  @Cron(CronExpression.EVERY_HOUR, { name: 'opportunity-expiry' })
  async expireOpportunities() {
    const now = new Date();

    const expired = await this.prisma.opportunity.findMany({
      where: {
        status: 'PUBLISHED',
        closesAt: { lt: now },
      },
      select: { id: true, requesterId: true, title: true },
    });

    if (!expired.length) return;

    await this.prisma.opportunity.updateMany({
      where: { id: { in: expired.map((o) => o.id) }, status: 'PUBLISHED', closesAt: { lt: now } },
      data: { status: 'CLOSED', closureNote: 'Auto-closed: closing date passed' },
    });

    // Audit each closure
    for (const opp of expired) {
      await this.auditService.log({
        entityType: AuditEntityType.OPPORTUNITY,
        entityId: opp.id,
        action: 'auto_expired',
        actorId: 'system',
        oldState: { status: 'PUBLISHED' },
        newState: { status: 'CLOSED', reason: 'closesAt passed' },
      });
    }

    this.logger.log(`Expired ${expired.length} opportunity/opportunities`);
  }

  /**
   * BADGE EXPIRY — runs daily at 01:00.
   * Marks ACTIVE trust badges as EXPIRED when validUntil has passed.
   */
  @Cron('0 1 * * *', { name: 'badge-expiry' })
  async expireBadges() {
    const now = new Date();

    const result = await this.prisma.trustBadge.updateMany({
      where: {
        status: 'ACTIVE',
        validUntil: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`Expired ${result.count} trust badge(s)`);
    }
  }

  /**
   * REPUTATION RECALCULATION — runs daily at 02:00.
   * Recalculates reputationScore for all users from their received feedback.
   * Runs as a sweep to correct any drift from real-time updates.
   */
  @Cron('0 2 * * *', { name: 'reputation-recalc' })
  async recalculateReputation() {
    const usersWithFeedback = await this.prisma.engagementFeedback.groupBy({
      by: ['forUserId'],
      _avg: { rating: true },
      _count: { _all: true },
    });

    let updated = 0;
    for (const { forUserId, _avg, _count } of usersWithFeedback) {
      if (!_avg.rating) continue;
      const score = Math.round(_avg.rating * 10) / 10;

      await this.prisma.trustRecord.upsert({
        where: { userId: forUserId },
        update: { reputationScore: score, completedEngagements: _count._all },
        create: {
          userId: forUserId,
          currentLevel: 'L0_REGISTERED',
          reputationScore: score,
          completedEngagements: _count._all,
        },
      });
      updated++;
    }

    if (updated > 0) {
      this.logger.log(`Recalculated reputation for ${updated} user(s)`);
    }
  }

  /**
   * STALE VERIFICATION CLEANUP — runs weekly on Sunday at 03:00.
   * Notifies or flags verification requests older than 14 days with no action.
   */
  @Cron('0 3 * * 0', { name: 'stale-verification-alert' })
  async alertStaleVerifications() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const stale = await this.prisma.verificationRequest.findMany({
      where: {
        status: 'pending',
        requestedAt: { lt: fourteenDaysAgo },
      },
      select: { id: true, userId: true, requestedAt: true },
    });

    if (stale.length > 0) {
      this.logger.warn(
        `${stale.length} verification request(s) pending for over 14 days — moderation action required`,
        stale.map((r) => r.id),
      );
      // TODO Phase 2: send email alert to moderation cell admin
    }
  }

  /**
   * MODERATION QUEUE ALERT — runs every 4 hours.
   * Logs warning if more than 10 opportunities have been waiting in moderation > 48 hours.
   */
  @Cron('0 */4 * * *', { name: 'moderation-queue-alert' })
  async alertModerationBacklog() {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const backlog = await this.prisma.opportunity.count({
      where: {
        status: 'MODERATION',
        createdAt: { lt: fortyEightHoursAgo },
      },
    });

    if (backlog >= 10) {
      this.logger.warn(`Moderation backlog alert: ${backlog} opportunities waiting over 48 hours`);
      // TODO Phase 2: send in-app or email alert to moderators
    }
  }
}
