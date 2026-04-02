import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OpportunityStatus, AuditEntityType } from '@udyogasakha/types';
import { CreateOpportunityInput, OpportunityFiltersInput } from '@udyogasakha/validators';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(requesterId: string, dto: CreateOpportunityInput) {
    const opp = await this.prisma.opportunity.create({
      data: {
        requesterId,
        moduleType: dto.moduleType,
        title: dto.title,
        description: dto.description,
        trustLevelRequired: dto.trustLevelRequired,
        isPublic: dto.isPublic,
        details: dto.details as any,
        closesAt: dto.closesAt,
        status: OpportunityStatus.MODERATION,
      },
    });
    await this.auditService.log({ entityType: AuditEntityType.OPPORTUNITY, entityId: opp.id, action: 'created', actorId: requesterId, newState: { status: OpportunityStatus.MODERATION, moduleType: dto.moduleType } });
    return opp;
  }

  async findAll(filters: Partial<OpportunityFiltersInput>) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const where: any = { status: OpportunityStatus.PUBLISHED };

    if (filters.moduleType) where.moduleType = filters.moduleType;
    if (filters.trustLevelRequired !== undefined) where.trustLevelRequired = { lte: filters.trustLevelRequired };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.opportunity.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { publishedAt: 'desc' }, include: { requester: { include: { profile: true } } } }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id }, include: { requester: { include: { profile: true } } } });
    if (!opp) throw new NotFoundException('Opportunity not found');
    return opp;
  }

  async findByRequester(requesterId: string) {
    return this.prisma.opportunity.findMany({ where: { requesterId }, orderBy: { createdAt: 'desc' } });
  }

  async getPendingModeration() {
    return this.prisma.opportunity.findMany({ where: { status: OpportunityStatus.MODERATION }, orderBy: { createdAt: 'asc' } });
  }

  async publish(opportunityId: string, moderatorId: string) {
    const opp = await this.findById(opportunityId);
    if (opp.status !== OpportunityStatus.MODERATION) {
      throw new BadRequestException(`Cannot publish from status: ${opp.status}`);
    }
    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.PUBLISHED, publishedAt: new Date() },
    });
    await this.auditService.log({ entityType: AuditEntityType.OPPORTUNITY, entityId: opportunityId, action: 'published', actorId: moderatorId, oldState: { status: opp.status }, newState: { status: OpportunityStatus.PUBLISHED } });
    return updated;
  }

  async reject(opportunityId: string, moderatorId: string, reason: string) {
    const opp = await this.findById(opportunityId);
    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.REJECTED, rejectionReason: reason },
    });
    await this.auditService.log({ entityType: AuditEntityType.OPPORTUNITY, entityId: opportunityId, action: 'rejected', actorId: moderatorId, oldState: { status: opp.status }, newState: { status: OpportunityStatus.REJECTED, reason } });
    return updated;
  }

  async close(opportunityId: string, requesterId: string, note?: string) {
    const opp = await this.findById(opportunityId);
    if (opp.requesterId !== requesterId) throw new ForbiddenException('Only the requester can close this opportunity');
    const updated = await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { status: OpportunityStatus.CLOSED, closureNote: note },
    });
    await this.auditService.log({ entityType: AuditEntityType.OPPORTUNITY, entityId: opportunityId, action: 'closed', actorId: requesterId, newState: { status: OpportunityStatus.CLOSED, note } });
    return updated;
  }
}
