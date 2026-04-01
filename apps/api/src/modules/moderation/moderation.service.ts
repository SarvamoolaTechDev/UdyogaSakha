import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditEntityType, EnforcementActionType, AccountStatus } from '@udyogasakha/types';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ModerationService {
  // TODO: Replace with PrismaService
  private reports: any[] = [];
  private enforcementActions: any[] = [];

  constructor(
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
  ) {}

  // ── Reports ──────────────────────────────────────────────────────────────

  async submitReport(
    reporterId: string,
    subjectType: string,
    subjectId: string,
    reason: string,
    detail?: string,
  ) {
    const report = {
      id: crypto.randomUUID(),
      reporterId,
      subjectType,
      subjectId,
      reason,
      detail,
      status: 'pending',
      submittedAt: new Date(),
    };
    this.reports.push(report);
    return report;
  }

  async getPendingReports() {
    return this.reports.filter((r) => r.status === 'pending');
  }

  async resolveReport(reportId: string, moderatorId: string, resolution: string) {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) throw new NotFoundException('Report not found');

    report.status = 'resolved';
    report.resolution = resolution;
    report.resolvedBy = moderatorId;
    report.resolvedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: reportId,
      action: 'report_resolved',
      actorId: moderatorId,
      newState: { resolution },
    });

    return report;
  }

  // ── Enforcement Actions ──────────────────────────────────────────────────

  async enforce(
    targetUserId: string,
    action: EnforcementActionType,
    reason: string,
    moderatorId: string,
    expiresAt?: Date,
  ) {
    const enforcement = {
      id: crypto.randomUUID(),
      targetUserId,
      action,
      reason,
      moderatorId,
      expiresAt,
      createdAt: new Date(),
    };

    this.enforcementActions.push(enforcement);

    // Apply account-level effects
    if (action === EnforcementActionType.SUSPEND) {
      await this.usersService.updateStatus(targetUserId, AccountStatus.SUSPENDED);
    } else if (action === EnforcementActionType.RESTRICT) {
      await this.usersService.updateStatus(targetUserId, AccountStatus.RESTRICTED);
    }

    await this.auditService.log({
      entityType: AuditEntityType.ENFORCEMENT,
      entityId: targetUserId,
      action: `enforcement_${action}`,
      actorId: moderatorId,
      newState: { action, reason, expiresAt },
    });

    return enforcement;
  }

  async getEnforcementHistory(userId: string) {
    return this.enforcementActions.filter((e) => e.targetUserId === userId);
  }
}
