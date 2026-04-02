import { Injectable } from '@nestjs/common';
import { AuditEntityType } from '@udyogasakha/types';
import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogEntry {
  entityType: AuditEntityType;
  entityId: string;
  action: string;
  actorId: string;
  oldState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  ip?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: entry.entityType,
        entityId: entry.entityId,
        action: entry.action,
        actorId: entry.actorId,
        oldState: entry.oldState as any,
        newState: entry.newState as any,
        ip: entry.ip,
      },
    });
  }

  async getLogsForEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { ts: 'desc' },
    });
  }

  async getLogsForActor(actorId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }
}
