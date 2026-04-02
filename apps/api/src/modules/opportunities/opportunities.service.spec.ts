import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma, mockOpportunity } from '../../test/test-utils';
import { OpportunityStatus, ModuleType, TrustLevel } from '@udyogasakha/types';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<OpportunitiesService>(OpportunitiesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create opportunity with MODERATION status', async () => {
      const opp = mockOpportunity({ status: OpportunityStatus.MODERATION });
      prisma.opportunity.create.mockResolvedValue(opp);
      const result = await service.create('user-id', {
        moduleType: ModuleType.EMPLOYMENT_EXCHANGE,
        title: 'Test Opp',
        description: 'Long enough description here',
        trustLevelRequired: TrustLevel.L1_DOCUMENT_VERIFIED,
        isPublic: true,
        details: {},
      });
      expect(result.status).toBe(OpportunityStatus.MODERATION);
      expect(prisma.opportunity.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('publish', () => {
    it('should throw BadRequestException if not in MODERATION status', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ status: OpportunityStatus.PUBLISHED }));
      await expect(service.publish('opp-id', 'mod-id')).rejects.toThrow(BadRequestException);
    });

    it('should publish a MODERATION opportunity', async () => {
      const opp = mockOpportunity({ status: OpportunityStatus.MODERATION });
      prisma.opportunity.findUnique.mockResolvedValue(opp);
      prisma.opportunity.update.mockResolvedValue({ ...opp, status: OpportunityStatus.PUBLISHED });
      const result = await service.publish('opp-id', 'mod-id');
      expect(result.status).toBe(OpportunityStatus.PUBLISHED);
    });
  });

  describe('close', () => {
    it('should throw ForbiddenException if not the requester', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ requesterId: 'owner-id' }));
      await expect(service.close('opp-id', 'other-user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should close opportunity for the requester', async () => {
      const opp = mockOpportunity({ requesterId: 'user-test-id' });
      prisma.opportunity.findUnique.mockResolvedValue(opp);
      prisma.opportunity.update.mockResolvedValue({ ...opp, status: OpportunityStatus.CLOSED });
      const result = await service.close('opp-id', 'user-test-id', 'Filled internally');
      expect(result.status).toBe(OpportunityStatus.CLOSED);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException for unknown id', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
