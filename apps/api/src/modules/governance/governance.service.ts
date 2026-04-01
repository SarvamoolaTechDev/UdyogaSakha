import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CouncilType, AuditEntityType } from '@udyogasakha/types';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class GovernanceService {
  // TODO: Replace with PrismaService
  private members: any[] = [];
  private conflictDeclarations: any[] = [];
  private screeningSessions: any[] = [];

  constructor(private readonly auditService: AuditService) {}

  // ── Council Members ──────────────────────────────────────────────────────

  async addMember(
    userId: string,
    councilType: CouncilType,
    domain: string,
    addedBy: string,
  ) {
    const existing = this.members.find(
      (m) => m.userId === userId && m.councilType === councilType && m.active,
    );
    if (existing) throw new ConflictException('User is already an active member of this council');

    const member = {
      id: crypto.randomUUID(),
      userId,
      councilType,
      domain,
      active: true,
      addedAt: new Date(),
      addedBy,
    };
    this.members.push(member);

    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: member.id,
      action: 'governance_member_added',
      actorId: addedBy,
      newState: { userId, councilType, domain },
    });

    return member;
  }

  async deactivateMember(memberId: string, adminId: string) {
    const member = this.members.find((m) => m.id === memberId);
    if (!member) throw new NotFoundException('Member not found');

    member.active = false;
    member.deactivatedAt = new Date();

    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: memberId,
      action: 'governance_member_deactivated',
      actorId: adminId,
      oldState: { active: true },
      newState: { active: false },
    });

    return member;
  }

  async getActiveMembers(councilType?: CouncilType) {
    return this.members.filter(
      (m) => m.active && (!councilType || m.councilType === councilType),
    );
  }

  // ── Conflict of Interest Declarations ───────────────────────────────────

  async declareConflict(
    memberId: string,
    entityId: string,
    entityType: string,
    notes: string,
  ) {
    const declaration = {
      id: crypto.randomUUID(),
      memberId,
      entityId,
      entityType,
      notes,
      declaredAt: new Date(),
    };
    this.conflictDeclarations.push(declaration);

    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: memberId,
      action: 'conflict_declared',
      actorId: memberId,
      newState: { entityId, entityType, notes },
    });

    return declaration;
  }

  async getConflictDeclarations(memberId: string) {
    return this.conflictDeclarations.filter((d) => d.memberId === memberId);
  }

  // ── DEP Screening Sessions ───────────────────────────────────────────────

  async scheduleScreeningSession(
    candidateId: string,
    panelMemberId: string,
    scheduledAt: Date,
    domain: string,
  ) {
    // Ensure no active conflict of interest
    const conflicts = await this.getConflictDeclarations(panelMemberId);
    const hasConflict = conflicts.some((c) => c.entityId === candidateId);
    if (hasConflict) {
      throw new ConflictException(
        'Panel member has a declared conflict of interest with this candidate',
      );
    }

    const session = {
      id: crypto.randomUUID(),
      candidateId,
      panelMemberId,
      domain,
      scheduledAt,
      status: 'scheduled',
      outcome: null,
      notes: null,
      conductedAt: null,
    };
    this.screeningSessions.push(session);
    return session;
  }

  async recordSessionOutcome(
    sessionId: string,
    panelMemberId: string,
    outcome: 'approved' | 'rejected' | 'deferred',
    notes: string,
  ) {
    const session = this.screeningSessions.find((s) => s.id === sessionId);
    if (!session) throw new NotFoundException('Session not found');

    session.outcome = outcome;
    session.notes = notes;
    session.conductedAt = new Date();
    session.status = 'completed';

    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: sessionId,
      action: `screening_${outcome}`,
      actorId: panelMemberId,
      newState: { outcome, notes },
    });

    return session;
  }
}
