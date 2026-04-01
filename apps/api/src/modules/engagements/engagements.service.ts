import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  ApplicationStatus,
  EngagementStatus,
  AuditEntityType,
  OpportunityStatus,
} from '@udyogasakha/types';
import { AuditService } from '../audit/audit.service';
import { OpportunitiesService } from '../opportunities/opportunities.service';

@Injectable()
export class EngagementsService {
  // TODO: Replace with PrismaService
  private applications: any[] = [];
  private engagements: any[] = [];
  private feedback: any[] = [];

  constructor(
    private readonly auditService: AuditService,
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  // ── Applications ─────────────────────────────────────────────────────────

  async apply(opportunityId: string, providerId: string, coverMessage?: string) {
    const opp = await this.opportunitiesService.findById(opportunityId);

    if (opp.status !== OpportunityStatus.PUBLISHED) {
      throw new ForbiddenException('Opportunity is not open for applications');
    }

    if (opp.requesterId === providerId) {
      throw new ForbiddenException('You cannot apply to your own opportunity');
    }

    const existing = this.applications.find(
      (a) => a.opportunityId === opportunityId && a.providerId === providerId,
    );
    if (existing) throw new ConflictException('You have already applied to this opportunity');

    const application = {
      id: crypto.randomUUID(),
      opportunityId,
      providerId,
      coverMessage,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date(),
    };

    this.applications.push(application);

    await this.auditService.log({
      entityType: AuditEntityType.APPLICATION,
      entityId: application.id,
      action: 'submitted',
      actorId: providerId,
      newState: { opportunityId, status: ApplicationStatus.PENDING },
    });

    return application;
  }

  async getApplicationsForOpportunity(opportunityId: string, requesterId: string) {
    const opp = await this.opportunitiesService.findById(opportunityId);
    if (opp.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can view applications');
    }
    return this.applications.filter((a) => a.opportunityId === opportunityId);
  }

  async getMyApplications(providerId: string) {
    return this.applications.filter((a) => a.providerId === providerId);
  }

  async updateApplicationStatus(
    applicationId: string,
    requesterId: string,
    status: ApplicationStatus,
    reviewNote?: string,
  ) {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) throw new NotFoundException('Application not found');

    const opp = await this.opportunitiesService.findById(app.opportunityId);
    if (opp.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can update application status');
    }

    const old = app.status;
    app.status = status;
    app.reviewNote = reviewNote;
    app.reviewedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.APPLICATION,
      entityId: applicationId,
      action: 'status_updated',
      actorId: requesterId,
      oldState: { status: old },
      newState: { status, reviewNote },
    });

    // Auto-create an engagement when accepted
    if (status === ApplicationStatus.ACCEPTED) {
      await this.createEngagement(app.opportunityId, requesterId, app.providerId);
    }

    return app;
  }

  // ── Engagements ──────────────────────────────────────────────────────────

  private async createEngagement(
    opportunityId: string,
    requesterId: string,
    providerId: string,
  ) {
    const engagement = {
      id: crypto.randomUUID(),
      opportunityId,
      requesterId,
      providerId,
      status: EngagementStatus.INITIATED,
      startedAt: new Date(),
    };

    this.engagements.push(engagement);

    await this.auditService.log({
      entityType: AuditEntityType.ENGAGEMENT,
      entityId: engagement.id,
      action: 'created',
      actorId: requesterId,
      newState: { opportunityId, providerId, status: EngagementStatus.INITIATED },
    });

    return engagement;
  }

  async getMyEngagements(userId: string) {
    return this.engagements.filter(
      (e) => e.requesterId === userId || e.providerId === userId,
    );
  }

  async closeEngagement(
    engagementId: string,
    userId: string,
    status: EngagementStatus.COMPLETED | EngagementStatus.CANCELLED,
    note?: string,
  ) {
    const eng = this.engagements.find((e) => e.id === engagementId);
    if (!eng) throw new NotFoundException('Engagement not found');

    if (eng.requesterId !== userId && eng.providerId !== userId) {
      throw new ForbiddenException('Not a party to this engagement');
    }

    const old = eng.status;
    eng.status = status;
    eng.closedAt = new Date();
    eng.closureNote = note;

    await this.auditService.log({
      entityType: AuditEntityType.ENGAGEMENT,
      entityId: engagementId,
      action: status === EngagementStatus.COMPLETED ? 'completed' : 'cancelled',
      actorId: userId,
      oldState: { status: old },
      newState: { status, note },
    });

    return eng;
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  async submitFeedback(
    engagementId: string,
    byUserId: string,
    rating: number,
    comment?: string,
  ) {
    const eng = this.engagements.find((e) => e.id === engagementId);
    if (!eng) throw new NotFoundException('Engagement not found');

    if (eng.status !== EngagementStatus.COMPLETED) {
      throw new ForbiddenException('Feedback can only be submitted after completion');
    }

    if (eng.requesterId !== byUserId && eng.providerId !== byUserId) {
      throw new ForbiddenException('Not a party to this engagement');
    }

    const forUserId = eng.requesterId === byUserId ? eng.providerId : eng.requesterId;

    const fb = {
      id: crypto.randomUUID(),
      engagementId,
      byUserId,
      forUserId,
      rating,
      comment,
      submittedAt: new Date(),
    };
    this.feedback.push(fb);
    return fb;
  }
}
