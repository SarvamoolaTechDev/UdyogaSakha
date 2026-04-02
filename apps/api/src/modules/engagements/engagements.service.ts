import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import {
  ApplicationStatus, EngagementStatus, AuditEntityType, OpportunityStatus,
} from '@udyogasakha/types';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EngagementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ── Applications ─────────────────────────────────────────────────────────

  async apply(opportunityId: string, providerId: string, coverMessage?: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.status !== OpportunityStatus.PUBLISHED)
      throw new ForbiddenException('Opportunity is not open for applications');
    if (opp.requesterId === providerId)
      throw new ForbiddenException('You cannot apply to your own opportunity');

    const existing = await this.prisma.application.findUnique({
      where: { opportunityId_providerId: { opportunityId, providerId } },
    });
    if (existing) throw new ConflictException('You have already applied to this opportunity');

    const application = await this.prisma.application.create({
      data: { opportunityId, providerId, coverMessage, status: ApplicationStatus.PENDING },
    });

    await this.auditService.log({
      entityType: AuditEntityType.APPLICATION, entityId: application.id,
      action: 'submitted', actorId: providerId,
      newState: { opportunityId, status: ApplicationStatus.PENDING },
    });
    return application;
  }

  async getApplicationsForOpportunity(opportunityId: string, requesterId: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id: opportunityId } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    if (opp.requesterId !== requesterId)
      throw new ForbiddenException('Only the requester can view applications');
    return this.prisma.application.findMany({
      where: { opportunityId },
      include: { provider: { include: { profile: true, trustRecord: true } } },
    });
  }

  async getMyApplications(providerId: string) {
    return this.prisma.application.findMany({
      where: { providerId },
      include: { opportunity: true },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    applicationId: string, requesterId: string,
    status: ApplicationStatus, reviewNote?: string,
  ) {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { opportunity: true },
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.opportunity.requesterId !== requesterId)
      throw new ForbiddenException('Only the requester can update application status');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status, reviewNote, reviewedAt: new Date() },
    });

    await this.auditService.log({
      entityType: AuditEntityType.APPLICATION, entityId: applicationId,
      action: 'status_updated', actorId: requesterId,
      oldState: { status: app.status }, newState: { status, reviewNote },
    });

    if (status === ApplicationStatus.ACCEPTED) {
      await this.createEngagement(app.opportunityId, requesterId, app.providerId);
    }
    return updated;
  }

  // ── Engagements ───────────────────────────────────────────────────────────

  private async createEngagement(
    opportunityId: string, requesterId: string, providerId: string,
  ) {
    const engagement = await this.prisma.engagement.create({
      data: { opportunityId, requesterId, providerId, status: EngagementStatus.INITIATED },
    });
    await this.auditService.log({
      entityType: AuditEntityType.ENGAGEMENT, entityId: engagement.id,
      action: 'created', actorId: requesterId,
      newState: { opportunityId, providerId, status: EngagementStatus.INITIATED },
    });
    return engagement;
  }

  async findById(id: string) {
    const eng = await this.prisma.engagement.findUnique({
      where: { id },
      include: { opportunity: true },
    });
    if (!eng) throw new NotFoundException('Engagement not found');
    return eng;
  }

  async getMyEngagements(userId: string) {
    return this.prisma.engagement.findMany({
      where: { OR: [{ requesterId: userId }, { providerId: userId }] },
      include: { opportunity: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async closeEngagement(
    engagementId: string, userId: string,
    status: EngagementStatus.COMPLETED | EngagementStatus.CANCELLED,
    note?: string,
  ) {
    const eng = await this.prisma.engagement.findUnique({ where: { id: engagementId } });
    if (!eng) throw new NotFoundException('Engagement not found');
    if (eng.requesterId !== userId && eng.providerId !== userId)
      throw new ForbiddenException('Not a party to this engagement');

    const updated = await this.prisma.engagement.update({
      where: { id: engagementId },
      data: { status, closedAt: new Date(), closureNote: note },
    });

    await this.auditService.log({
      entityType: AuditEntityType.ENGAGEMENT, entityId: engagementId,
      action: status === EngagementStatus.COMPLETED ? 'completed' : 'cancelled',
      actorId: userId,
      oldState: { status: eng.status }, newState: { status, note },
    });

    if (status === EngagementStatus.COMPLETED) {
      await this.prisma.trustRecord.updateMany({
        where: { userId: { in: [eng.requesterId, eng.providerId] } },
        data: { completedEngagements: { increment: 1 } },
      });
    }
    return updated;
  }

  // ── Feedback ──────────────────────────────────────────────────────────────

  async submitFeedback(
    engagementId: string, byUserId: string, rating: number, comment?: string,
  ) {
    const eng = await this.prisma.engagement.findUnique({ where: { id: engagementId } });
    if (!eng) throw new NotFoundException('Engagement not found');
    if (eng.status !== EngagementStatus.COMPLETED)
      throw new ForbiddenException('Feedback can only be submitted after completion');
    if (eng.requesterId !== byUserId && eng.providerId !== byUserId)
      throw new ForbiddenException('Not a party to this engagement');

    const forUserId = eng.requesterId === byUserId ? eng.providerId : eng.requesterId;

    const feedback = await this.prisma.engagementFeedback.create({
      data: { engagementId, byUserId, forUserId, rating, comment },
    });

    const allFeedback = await this.prisma.engagementFeedback.findMany({ where: { forUserId } });
    const avg = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    await this.prisma.trustRecord.update({
      where: { userId: forUserId },
      data: { reputationScore: Math.round(avg * 10) / 10 },
    });

    return feedback;
  }
}
