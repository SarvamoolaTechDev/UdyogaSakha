import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CouncilType, AuditEntityType } from '@udyogasakha/types';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class GovernanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async addMember(userId: string, councilType: CouncilType, domain: string, addedBy: string) {
    const existing = await this.prisma.governanceMember.findFirst({
      where: { userId, councilType, active: true },
    });
    if (existing) throw new ConflictException('User is already an active member of this council');

    const member = await this.prisma.governanceMember.create({
      data: { userId, councilType, domain, addedBy, active: true },
    });
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
    const member = await this.prisma.governanceMember.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const updated = await this.prisma.governanceMember.update({
      where: { id: memberId },
      data: { active: false, deactivatedAt: new Date() },
    });
    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: memberId,
      action: 'governance_member_deactivated',
      actorId: adminId,
      oldState: { active: true },
      newState: { active: false },
    });
    return updated;
  }

  async getActiveMembers(councilType?: CouncilType) {
    return this.prisma.governanceMember.findMany({
      where: { active: true, ...(councilType ? { councilType } : {}) },
      include: { user: { include: { profile: true } } },
    });
  }

  async declareConflict(memberId: string, entityId: string, entityType: string, notes: string) {
    const declaration = await this.prisma.conflictDeclaration.create({
      data: { memberId, entityId, entityType, notes },
    });
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
    return this.prisma.conflictDeclaration.findMany({
      where: { memberId },
      orderBy: { declaredAt: 'desc' },
    });
  }

  async scheduleScreeningSession(
    candidateId: string,
    panelMemberId: string,
    scheduledAt: Date,
    domain: string,
  ) {
    const conflicts = await this.prisma.conflictDeclaration.findMany({
      where: { memberId: panelMemberId, entityId: candidateId },
    });
    if (conflicts.length > 0) {
      throw new ConflictException(
        'Panel member has a declared conflict of interest with this candidate',
      );
    }

    return this.prisma.screeningSession.create({
      data: { candidateId, panelMemberId, domain, scheduledAt, status: 'scheduled' },
    });
  }

  async recordSessionOutcome(
    sessionId: string,
    panelMemberId: string,
    outcome: 'approved' | 'rejected' | 'deferred',
    notes: string,
  ) {
    const session = await this.prisma.screeningSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');

    const updated = await this.prisma.screeningSession.update({
      where: { id: sessionId },
      data: { outcome, notes, conductedAt: new Date(), status: 'completed' },
    });
    await this.auditService.log({
      entityType: AuditEntityType.MODERATION,
      entityId: sessionId,
      action: `screening_${outcome}`,
      actorId: panelMemberId,
      newState: { outcome, notes },
    });
    return updated;
  }
}
