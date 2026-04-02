import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';
import { AuditEntityType } from '@udyogasakha/types';

describe('AuditService', () => {
  let service: AuditService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<AuditService>(AuditService);
  });

  describe('log', () => {
    it('should persist an audit log entry', async () => {
      prisma.auditLog.create.mockResolvedValue({ id: 'log-1' });
      await service.log({
        entityType: AuditEntityType.OPPORTUNITY,
        entityId: 'opp-1',
        action: 'created',
        actorId: 'user-1',
        newState: { status: 'MODERATION' },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLogsForEntity', () => {
    it('should return logs for a given entity', async () => {
      prisma.auditLog.findMany.mockResolvedValue([{ id: 'log-1', action: 'created' }]);
      const result = await service.getLogsForEntity(AuditEntityType.OPPORTUNITY, 'opp-1');
      expect(result).toHaveLength(1);
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { entityType: AuditEntityType.OPPORTUNITY, entityId: 'opp-1' } }),
      );
    });
  });
});
