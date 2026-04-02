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
    it('should throw ForbiddenException if opportunity is not PUBLISHED', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ status: OpportunityStatus.CLOSED }));
      await expect(service.apply('opp-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if applying to own opportunity', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ requesterId: 'user-id', status: OpportunityStatus.PUBLISHED }));
      await expect(service.apply('opp-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException on duplicate application', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ requesterId: 'requester-id', status: OpportunityStatus.PUBLISHED }));
      prisma.application.findUnique.mockResolvedValue({ id: 'existing-app' });
      await expect(service.apply('opp-id', 'provider-id')).rejects.toThrow(ConflictException);
    });

    it('should create application successfully', async () => {
      prisma.opportunity.findUnique.mockResolvedValue(mockOpportunity({ requesterId: 'requester-id', status: OpportunityStatus.PUBLISHED }));
      prisma.application.findUnique.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue({ id: 'app-1', status: ApplicationStatus.PENDING });
      const result = await service.apply('opp-id', 'provider-id', 'Cover message');
      expect(result.status).toBe(ApplicationStatus.PENDING);
    });
  });

  describe('submitFeedback', () => {
    it('should throw ForbiddenException if engagement not completed', async () => {
      prisma.engagement.findUnique.mockResolvedValue({ id: 'eng-1', status: EngagementStatus.IN_PROGRESS, requesterId: 'r-id', providerId: 'p-id' });
      await expect(service.submitFeedback('eng-1', 'r-id', 5)).rejects.toThrow(ForbiddenException);
    });
  });
});
