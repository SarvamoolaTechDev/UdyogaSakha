import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { EngagementsService } from './engagements.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma, mockOpportunity } from '../../test/test-utils';
import { ApplicationStatus, EngagementStatus, OpportunityStatus } from '@udyogasakha/types';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('EngagementsService', () => {
  let service: EngagementsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<EngagementsService>(EngagementsService);
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should throw NotFoundException if opportunity not found', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(null);
      await expect(service.apply('opp-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if opportunity is not PUBLISHED', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(
        mockOpportunity({ status: OpportunityStatus.CLOSED }),
      );
      await expect(service.apply('opp-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if applying to own opportunity', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(
        mockOpportunity({ requesterId: 'user-id', status: OpportunityStatus.PUBLISHED }),
      );
      await expect(service.apply('opp-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException on duplicate application', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(
        mockOpportunity({ requesterId: 'requester-id', status: OpportunityStatus.PUBLISHED }),
      );
      prisma.application.findUnique.mockResolvedValue({ id: 'existing-app' });
      await expect(service.apply('opp-id', 'provider-id')).rejects.toThrow(ConflictException);
    });

    it('should create application with PENDING status', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(
        mockOpportunity({ requesterId: 'requester-id', status: OpportunityStatus.PUBLISHED }),
      );
      prisma.application.findUnique.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.PENDING });

      const result = await service.apply('opp-id', 'provider-id', 'Great fit for this role');
      expect(result.status).toBe(ApplicationStatus.PENDING);
      expect(prisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ coverMessage: 'Great fit for this role' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException for unknown id', async () => {
      prisma.engagement.findUnique.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return engagement when found', async () => {
      prisma.engagement.findUnique.mockResolvedValue({ id: 'eng-1', status: EngagementStatus.INITIATED });
      const result = await service.findById('eng-1');
      expect(result.id).toBe('eng-1');
    });
  });

  describe('closeEngagement', () => {
    it('should throw ForbiddenException if not a party to the engagement', async () => {
      prisma.engagement.findUnique.mockResolvedValue({
        id: 'eng-1', requesterId: 'r-id', providerId: 'p-id', status: EngagementStatus.INITIATED,
      });
      await expect(
        service.closeEngagement('eng-1', 'stranger-id', EngagementStatus.COMPLETED),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should complete engagement and increment completedEngagements', async () => {
      prisma.engagement.findUnique.mockResolvedValue({
        id: 'eng-1', requesterId: 'r-id', providerId: 'p-id', status: EngagementStatus.IN_PROGRESS,
      });
      prisma.engagement.update.mockResolvedValue({ id: 'eng-1', status: EngagementStatus.COMPLETED });
      prisma.trustRecord.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.closeEngagement('eng-1', 'r-id', EngagementStatus.COMPLETED, 'Done!');
      expect(result.status).toBe(EngagementStatus.COMPLETED);
      expect(prisma.trustRecord.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { completedEngagements: { increment: 1 } } }),
      );
    });
  });

  describe('submitFeedback', () => {
    it('should throw ForbiddenException if engagement not completed', async () => {
      prisma.engagement.findUnique.mockResolvedValue({
        id: 'eng-1', status: EngagementStatus.IN_PROGRESS, requesterId: 'r-id', providerId: 'p-id',
      });
      await expect(service.submitFeedback('eng-1', 'r-id', 5)).rejects.toThrow(ForbiddenException);
    });

    it('should create feedback and update reputation score', async () => {
      prisma.engagement.findUnique.mockResolvedValue({
        id: 'eng-1', status: EngagementStatus.COMPLETED, requesterId: 'r-id', providerId: 'p-id',
      });
      prisma.engagementFeedback.create.mockResolvedValue({ id: 'fb-1', rating: 4 });
      prisma.engagementFeedback.findMany.mockResolvedValue([
        { rating: 4 }, { rating: 5 },
      ]);
      prisma.trustRecord.update.mockResolvedValue({});

      await service.submitFeedback('eng-1', 'r-id', 4, 'Great work');
      expect(prisma.engagementFeedback.create).toHaveBeenCalledTimes(1);
      expect(prisma.trustRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { reputationScore: 4.5 } }),
      );
    });
  });
});
