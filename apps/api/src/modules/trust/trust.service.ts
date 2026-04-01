import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TrustLevel, TrustBadgeStatus, AuditEntityType } from '@udyogasakha/types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TrustService {
  // TODO: Replace with PrismaService
  private trustRecords: Map<string, any> = new Map();
  private badges: any[] = [];

  constructor(private readonly auditService: AuditService) {}

  async getTrustSummary(userId: string) {
    const record = this.trustRecords.get(userId) ?? {
      userId,
      currentLevel: TrustLevel.L0_REGISTERED,
      badges: [],
      reputationScore: 0,
      completedEngagements: 0,
    };
    return record;
  }

  /**
   * Request elevation from L0 → L1 (document verification).
   * Documents are uploaded separately via storage service.
   */
  async requestDocumentVerification(userId: string, documentIds: string[]) {
    const current = await this.getTrustSummary(userId);

    if (current.currentLevel >= TrustLevel.L1_DOCUMENT_VERIFIED) {
      throw new BadRequestException('Already at L1 or higher');
    }

    // Creates a pending verification task — picked up by moderation queue
    const request = {
      id: crypto.randomUUID(),
      userId,
      documentIds,
      requestedAt: new Date(),
      status: 'pending',
    };

    await this.auditService.log({
      entityType: AuditEntityType.TRUST_LEVEL,
      entityId: userId,
      action: 'verification_requested',
      actorId: userId,
      newState: { level: 'L1_pending', documentIds },
    });

    return request;
  }

  /**
   * Approve L1 — called by moderator after document review.
   */
  async approveL1(userId: string, moderatorId: string) {
    await this.elevateLevel(userId, TrustLevel.L1_DOCUMENT_VERIFIED, moderatorId);
    await this.grantBadge(userId, 'document_verified', moderatorId);
  }

  /**
   * Schedule L2 Foundation Screening interview.
   */
  async scheduleScreening(userId: string, scheduledAt: Date, panelMemberId: string) {
    const current = await this.getTrustSummary(userId);
    if (current.currentLevel < TrustLevel.L1_DOCUMENT_VERIFIED) {
      throw new ForbiddenException('L1 verification required before L2 screening');
    }

    const session = {
      id: crypto.randomUUID(),
      userId,
      panelMemberId,
      scheduledAt,
      status: 'scheduled',
      outcome: null,
    };

    await this.auditService.log({
      entityType: AuditEntityType.TRUST_LEVEL,
      entityId: userId,
      action: 'screening_scheduled',
      actorId: panelMemberId,
      newState: { scheduledAt, panelMemberId },
    });

    return session;
  }

  /**
   * Record L2 screening outcome.
   */
  async recordScreeningOutcome(
    sessionId: string,
    userId: string,
    outcome: 'approved' | 'rejected',
    panelMemberId: string,
    notes: string,
  ) {
    if (outcome === 'approved') {
      await this.elevateLevel(userId, TrustLevel.L2_FOUNDATION_SCREENED, panelMemberId);
      await this.grantBadge(userId, 'foundation_screened', panelMemberId);
    }

    await this.auditService.log({
      entityType: AuditEntityType.TRUST_LEVEL,
      entityId: userId,
      action: `screening_${outcome}`,
      actorId: panelMemberId,
      newState: { outcome, notes },
    });

    return { sessionId, outcome };
  }

  /**
   * Revoke a trust badge (moderation enforcement action).
   */
  async revokeBadge(badgeId: string, reason: string, moderatorId: string) {
    const badge = this.badges.find((b) => b.id === badgeId);
    if (!badge) throw new BadRequestException('Badge not found');

    badge.status = TrustBadgeStatus.REVOKED;
    badge.revokedAt = new Date();
    badge.revokeReason = reason;

    await this.auditService.log({
      entityType: AuditEntityType.TRUST_BADGE,
      entityId: badgeId,
      action: 'badge_revoked',
      actorId: moderatorId,
      newState: { reason },
    });

    return badge;
  }

  private async elevateLevel(userId: string, level: TrustLevel, grantedBy: string) {
    const existing = this.trustRecords.get(userId) ?? { userId, badges: [], reputationScore: 0, completedEngagements: 0 };
    const oldLevel = existing.currentLevel;
    existing.currentLevel = level;
    this.trustRecords.set(userId, existing);

    await this.auditService.log({
      entityType: AuditEntityType.TRUST_LEVEL,
      entityId: userId,
      action: 'level_elevated',
      actorId: grantedBy,
      oldState: { level: oldLevel },
      newState: { level },
    });
  }

  private async grantBadge(userId: string, badgeType: string, grantedBy: string) {
    const badge = {
      id: crypto.randomUUID(),
      userId,
      badgeType,
      grantedAt: new Date(),
      grantedBy,
      status: TrustBadgeStatus.ACTIVE,
    };
    this.badges.push(badge);
    return badge;
  }
}
