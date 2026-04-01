import { Injectable } from '@nestjs/common';
import { AuditEntityType } from '@udyogasakha/types';

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
  // TODO: Replace with PrismaService — audit_log table is append-only, never update/delete
  private logs: Array<AuditLogEntry & { id: string; ts: Date }> = [];

  async log(entry: AuditLogEntry): Promise<void> {
    this.logs.push({
      ...entry,
      id: crypto.randomUUID(),
      ts: new Date(),
    });
    // In production: also emit to structured logging (e.g. Winston → CloudWatch)
  }

  async getLogsForEntity(entityType: AuditEntityType, entityId: string) {
    return this.logs
      .filter((l) => l.entityType === entityType && l.entityId === entityId)
      .sort((a, b) => b.ts.getTime() - a.ts.getTime());
  }

  async getLogsForActor(actorId: string, limit = 50) {
    return this.logs
      .filter((l) => l.actorId === actorId)
      .sort((a, b) => b.ts.getTime() - a.ts.getTime())
      .slice(0, limit);
  }
}
