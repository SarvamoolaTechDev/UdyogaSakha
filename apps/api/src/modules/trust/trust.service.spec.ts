import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TrustService } from './trust.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';
import { TrustLevel, TrustBadgeStatus } from '@udyogasakha/types';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('TrustService', () => {
  let service: TrustService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrustService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<TrustService>(TrustService);
    jest.clearAllMocks();
  });

  describe('getTrustSummary', () => {
    it('should return L0 defaults when no trust record exists', async () => {
      prisma.trustRecord.findUnique.mockResolvedValue(null);
      prisma.trustBadge.findMany.mockResolvedValue([]);
      const result = await service.getTrustSummary('user-id');
      expect(result.currentLevel).toBe(TrustLevel.L0_REGISTERED);
      expect(result.badges).toHaveLength(0);
    });

    it('should return existing trust record data', async () => {
      prisma.trustRecord.findUnique.mockResolvedValue({ currentLevel: TrustLevel.L1_DOCUMENT_VERIFIED, reputationScore: 4.2, completedEngagements: 3 });
      prisma.trustBadge.findMany.mockResolvedValue([{ id: 'badge-1', badgeType: 'document_verified' }]);
      const result = await service.getTrustSummary('user-id');
      expect(result.currentLevel).toBe(TrustLevel.L1_DOCUMENT_VERIFIED);
      expect(result.reputationScore).toBe(4.2);
    });
  });

  describe('requestDocumentVerification', () => {
    it('should throw if already at L1 or higher', async () => {
      prisma.trustRecord.findUnique.mockResolvedValue({ currentLevel: TrustLevel.L1_DOCUMENT_VERIFIED });
      prisma.trustBadge.findMany.mockResolvedValue([]);
      await expect(
        service.requestDocumentVerification('user-id', ['doc-1']),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create verification request for L0 users', async () => {
      prisma.trustRecord.findUnique.mockResolvedValue(null);
      prisma.trustBadge.findMany.mockResolvedValue([]);
      prisma.verificationRequest.create.mockResolvedValue({ id: 'req-1', status: 'pending' });
      const result = await service.requestDocumentVerification('user-id', ['doc-1']);
      expect(result.status).toBe('pending');
    });
  });

  describe('revokeBadge', () => {
    it('should throw NotFoundException if badge does not exist', async () => {
      prisma.trustBadge.findUnique.mockResolvedValue(null);
      await expect(service.revokeBadge('bad-id', 'policy violation', 'mod-id')).rejects.toThrow();
    });

    it('should revoke an active badge', async () => {
      prisma.trustBadge.findUnique.mockResolvedValue({ id: 'badge-1', status: TrustBadgeStatus.ACTIVE });
      prisma.trustBadge.update.mockResolvedValue({ id: 'badge-1', status: TrustBadgeStatus.REVOKED });
      const result = await service.revokeBadge('badge-1', 'policy violation', 'mod-id');
      expect(result.status).toBe(TrustBadgeStatus.REVOKED);
    });
  });
});
