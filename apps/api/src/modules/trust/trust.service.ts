import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TrustLevel, TrustBadgeStatus, AuditEntityType } from '@udyogasakha/types';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TrustService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getTrustSummary(userId: string) {
    const record = await this.prisma.trustRecord.findUnique({ where: { userId } });
    const badges = await this.prisma.trustBadge.findMany({ where: { userId } });
    return { userId, currentLevel: record?.currentLevel ?? TrustLevel.L0_REGISTERED, badges, reputationScore: record?.reputationScore ?? 0, completedEngagements: record?.completedEngagements ?? 0 };
  }

  async requestDocumentVerification(userId: string, documentIds: string[]) {
    const trust = await this.getTrustSummary(userId);
    if (trust.currentLevel >= TrustLevel.L1_DOCUMENT_VERIFIED) {
      throw new BadRequestException('Already at L1 or higher');
    }
    const request = await this.prisma.verificationRequest.create({
      data: { userId, documentIds, status: 'pending' },
    });
    await this.auditService.log({ entityType: AuditEntityType.TRUST_LEVEL, entityId: userId, action: 'verification_requested', actorId: userId, newState: { documentIds } });
    return request;
  }

  async approveL1(userId: string, moderatorId: string) {
    await this.elevateLevel(userId, TrustLevel.L1_DOCUMENT_VERIFIED, moderatorId);
    await this.grantBadge(userId, 'document_verified', moderatorId);
    await this.prisma.verificationRequest.updateMany({
      where: { userId, status: 'pending' },
      data: { status: 'approved', reviewedAt: new Date(), reviewerId: moderatorId },
    });
  }

  async scheduleScreening(userId: string, scheduledAt: Date, panelMemberId: string, domain: string) {
    const trust = await this.getTrustSummary(userId);
    if (trust.currentLevel < TrustLevel.L1_DOCUMENT_VERIFIED) {
      throw new ForbiddenException('L1 verification required before L2 screening');
    }
    const session = await this.prisma.screeningSession.create({
      data: { candidateId: userId, panelMemberId, scheduledAt, domain, status: 'scheduled' },
    });
    await this.auditService.log({ entityType: AuditEntityType.TRUST_LEVEL, entityId: userId, action: 'screening_scheduled', actorId: panelMemberId, newState: { scheduledAt, panelMemberId } });
    return session;
  }

  async recordScreeningOutcome(sessionId: string, userId: string, outcome: 'approved' | 'rejected', panelMemberId: string, notes: string) {
    const session = await this.prisma.screeningSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Screening session not found');

    await this.prisma.screeningSession.update({
      where: { id: sessionId },
      data: { outcome, notes, conductedAt: new Date(), status: 'completed' },
    });

    if (outcome === 'approved') {
      await this.elevateLevel(userId, TrustLevel.L2_FOUNDATION_SCREENED, panelMemberId);
      await this.grantBadge(userId, 'foundation_screened', panelMemberId);
    }

    await this.auditService.log({ entityType: AuditEntityType.TRUST_LEVEL, entityId: userId, action: `screening_${outcome}`, actorId: panelMemberId, newState: { outcome, notes } });
    return { sessionId, outcome };
  }

  async revokeBadge(badgeId: string, reason: string, moderatorId: string) {
    const badge = await this.prisma.trustBadge.findUnique({ where: { id: badgeId } });
    if (!badge) throw new NotFoundException('Badge not found');

    const updated = await this.prisma.trustBadge.update({
      where: { id: badgeId },
      data: { status: TrustBadgeStatus.REVOKED, revokedAt: new Date(), revokeReason: reason },
    });

    await this.auditService.log({ entityType: AuditEntityType.TRUST_BADGE, entityId: badgeId, action: 'badge_revoked', actorId: moderatorId, newState: { reason } });
    return updated;
  }

  private async elevateLevel(userId: string, level: TrustLevel, grantedBy: string) {
    const existing = await this.prisma.trustRecord.findUnique({ where: { userId } });
    const oldLevel = existing?.currentLevel;

    await this.prisma.trustRecord.upsert({
      where: { userId },
      create: { userId, currentLevel: level, reputationScore: 0, completedEngagements: 0 },
      update: { currentLevel: level },
    });

    await this.auditService.log({ entityType: AuditEntityType.TRUST_LEVEL, entityId: userId, action: 'level_elevated', actorId: grantedBy, oldState: { level: oldLevel }, newState: { level } });
  }

  private async grantBadge(userId: string, badgeType: string, grantedBy: string) {
    return this.prisma.trustBadge.create({
      data: { userId, badgeType, grantedBy, status: TrustBadgeStatus.ACTIVE },
    });
  }
}
