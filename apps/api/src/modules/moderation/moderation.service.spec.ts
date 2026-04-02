import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';
import { EnforcementActionType } from '@udyogasakha/types';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('ModerationService', () => {
  let service: ModerationService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModerationService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<ModerationService>(ModerationService);
    jest.clearAllMocks();
  });

  describe('submitReport', () => {
    it('should create a report with pending status', async () => {
      prisma.report.create.mockResolvedValue({ id: 'report-1', status: 'pending' });
      const result = await service.submitReport('reporter-id', 'user', 'target-id', 'harassment');
      expect(result.status).toBe('pending');
    });
  });

  describe('resolveReport', () => {
    it('should throw NotFoundException for unknown report', async () => {
      prisma.report.findUnique.mockResolvedValue(null);
      await expect(service.resolveReport('bad-id', 'mod-id', 'dismissed')).rejects.toThrow(NotFoundException);
    });

    it('should resolve an existing report', async () => {
      prisma.report.findUnique.mockResolvedValue({ id: 'report-1', status: 'pending' });
      prisma.report.update.mockResolvedValue({ id: 'report-1', status: 'resolved' });
      const result = await service.resolveReport('report-1', 'mod-id', 'Warning issued');
      expect(result.status).toBe('resolved');
    });
  });

  describe('enforce', () => {
    it('should update user status to SUSPENDED for SUSPEND action', async () => {
      prisma.enforcementAction.create.mockResolvedValue({ id: 'enf-1', action: EnforcementActionType.SUSPEND });
      prisma.user.update.mockResolvedValue({});
      await service.enforce('user-id', EnforcementActionType.SUSPEND, 'repeated violations', 'mod-id');
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'SUSPENDED' } }));
    });

    it('should NOT update user status for WARNING action', async () => {
      prisma.enforcementAction.create.mockResolvedValue({ id: 'enf-2', action: EnforcementActionType.WARNING });
      await service.enforce('user-id', EnforcementActionType.WARNING, 'first offence', 'mod-id');
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});
