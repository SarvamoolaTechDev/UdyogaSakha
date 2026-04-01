import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { OpportunityStatus, AuditEntityType } from '@udyogasakha/types';
import { CreateOpportunityInput, OpportunityFiltersInput } from '@udyogasakha/validators';
import { TrustService } from '../trust/trust.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OpportunitiesService {
  // TODO: Replace with PrismaService
  private opportunities: any[] = [];

  constructor(
    private readonly trustService: TrustService,
    private readonly auditService: AuditService,
  ) {}

  async create(requesterId: string, dto: CreateOpportunityInput) {
    const opportunity = {
      id: crypto.randomUUID(),
      requesterId,
      ...dto,
      status: OpportunityStatus.MODERATION, // Always goes to moderation first
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.opportunities.push(opportunity);

    await this.auditService.log({
      entityType: AuditEntityType.OPPORTUNITY,
      entityId: opportunity.id,
      action: 'created',
      actorId: requesterId,
      newState: { status: OpportunityStatus.MODERATION, moduleType: dto.moduleType },
    });

    return opportunity;
  }

  async findAll(filters: OpportunityFiltersInput) {
    let results = this.opportunities.filter(
      (o) => o.status === OpportunityStatus.PUBLISHED,
    );

    if (filters.moduleType) {
      results = results.filter((o) => o.moduleType === filters.moduleType);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q),
      );
    }

    const total = results.length;
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const data = results.slice((page - 1) * limit, page * limit);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const opp = this.opportunities.find((o) => o.id === id);
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async findByRequester(requesterId: string) {
    return this.opportunities.filter((o) => o.requesterId === requesterId);
  }

  /** Moderation: publish an opportunity that passed review */
  async publish(opportunityId: string, moderatorId: string) {
    const opp = await this.findById(opportunityId);

    if (opp.status !== OpportunityStatus.MODERATION) {
      throw new BadRequestException(`Cannot publish from status: ${opp.status}`);
    }

    const old = opp.status;
    opp.status = OpportunityStatus.PUBLISHED;
    opp.publishedAt = new Date();
    opp.updatedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.OPPORTUNITY,
      entityId: opportunityId,
      action: 'published',
      actorId: moderatorId,
      oldState: { status: old },
      newState: { status: OpportunityStatus.PUBLISHED },
    });

    return opp;
  }

  /** Moderation: reject a listing */
  async reject(opportunityId: string, moderatorId: string, reason: string) {
    const opp = await this.findById(opportunityId);
    const old = opp.status;
    opp.status = OpportunityStatus.REJECTED;
    opp.rejectionReason = reason;
    opp.updatedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.OPPORTUNITY,
      entityId: opportunityId,
      action: 'rejected',
      actorId: moderatorId,
      oldState: { status: old },
      newState: { status: OpportunityStatus.REJECTED, reason },
    });

    return opp;
  }

  /** Requester closes their own opportunity */
  async close(opportunityId: string, requesterId: string, note?: string) {
    const opp = await this.findById(opportunityId);

    if (opp.requesterId !== requesterId) {
      throw new ForbiddenException('Only the requester can close this opportunity');
    }

    opp.status = OpportunityStatus.CLOSED;
    opp.closedAt = new Date();
    opp.closureNote = note;
    opp.updatedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.OPPORTUNITY,
      entityId: opportunityId,
      action: 'closed',
      actorId: requesterId,
      newState: { status: OpportunityStatus.CLOSED, note },
    });

    return opp;
  }
}
