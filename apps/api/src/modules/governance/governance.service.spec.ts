import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';
import { CouncilType } from '@udyogasakha/types';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('GovernanceService', () => {
  let service: GovernanceService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<GovernanceService>(GovernanceService);
    jest.clearAllMocks();
  });

  describe('addMember', () => {
    it('should throw ConflictException if already active member', async () => {
      prisma.governanceMember.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.addMember('user-id', CouncilType.EGC, 'finance', 'admin-id')).rejects.toThrow(ConflictException);
    });

    it('should add a new member', async () => {
      prisma.governanceMember.findFirst.mockResolvedValue(null);
      prisma.governanceMember.create.mockResolvedValue({ id: 'member-1', active: true });
      const result = await service.addMember('user-id', CouncilType.DEP, 'IT', 'admin-id');
      expect(result.active).toBe(true);
    });
  });

  describe('scheduleScreeningSession', () => {
    it('should throw ConflictException if panel member has conflict with candidate', async () => {
      prisma.conflictDeclaration.findMany.mockResolvedValue([{ id: 'conflict-1' }]);
      await expect(
        service.scheduleScreeningSession('candidate-id', 'panel-id', new Date(), 'IT'),
      ).rejects.toThrow(ConflictException);
    });

    it('should schedule session when no conflict exists', async () => {
      prisma.conflictDeclaration.findMany.mockResolvedValue([]);
      prisma.screeningSession.create.mockResolvedValue({ id: 'session-1', status: 'scheduled' });
      const result = await service.scheduleScreeningSession('candidate-id', 'panel-id', new Date(), 'IT');
      expect(result.status).toBe('scheduled');
    });
  });

  describe('deactivateMember', () => {
    it('should throw NotFoundException for unknown member', async () => {
      prisma.governanceMember.findUnique.mockResolvedValue(null);
      await expect(service.deactivateMember('bad-id', 'admin-id')).rejects.toThrow(NotFoundException);
    });
  });
});
