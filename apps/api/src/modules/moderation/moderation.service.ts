import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditEntityType, EnforcementActionType, AccountStatus } from '@udyogasakha/types';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ModerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async submitReport(reporterId: string, subjectType: string, subjectId: string, reason: string, detail?: string) {
    return this.prisma.report.create({ data: { reporterId, subjectType, subjectId, reason, detail, status: 'pending' } });
  }

  async getPendingReports() {
    return this.prisma.report.findMany({ where: { status: 'pending' }, include: { reporter: { include: { profile: true } } }, orderBy: { submittedAt: 'asc' } });
  }

  async resolveReport(reportId: string, moderatorId: string, resolution: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'resolved', resolution, resolvedBy: moderatorId, resolvedAt: new Date() },
    });
    await this.auditService.log({ entityType: AuditEntityType.MODERATION, entityId: reportId, action: 'report_resolved', actorId: moderatorId, newState: { resolution } });
    return updated;
  }

  async enforce(targetUserId: string, action: EnforcementActionType, reason: string, moderatorId: string, expiresAt?: Date) {
    const enforcement = await this.prisma.enforcementAction.create({
      data: { targetUserId, action, reason, actorId: moderatorId, expiresAt },
    });

    const statusMap: Partial<Record<EnforcementActionType, AccountStatus>> = {
      [EnforcementActionType.SUSPEND]: AccountStatus.SUSPENDED,
      [EnforcementActionType.RESTRICT]: AccountStatus.RESTRICTED,
    };
    if (statusMap[action]) {
      await this.prisma.user.update({ where: { id: targetUserId }, data: { status: statusMap[action] } });
    }

    await this.auditService.log({ entityType: AuditEntityType.ENFORCEMENT, entityId: targetUserId, action: `enforcement_${action}`, actorId: moderatorId, newState: { action, reason, expiresAt } });
    return enforcement;
  }

  async getEnforcementHistory(userId: string) {
    return this.prisma.enforcementAction.findMany({ where: { targetUserId: userId }, orderBy: { createdAt: 'desc' } });
  }
}
