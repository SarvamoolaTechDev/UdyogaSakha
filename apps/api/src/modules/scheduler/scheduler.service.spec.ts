import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { createMockPrisma } from '../../test/test-utils';

const mockAuditService = { log: jest.fn().mockResolvedValue(undefined) };

describe('SchedulerService', () => {
  let service: SchedulerService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();
    service = module.get<SchedulerService>(SchedulerService);
    jest.clearAllMocks();
  });

  describe('expireOpportunities', () => {
    it('should close expired published opportunities', async () => {
      prisma.opportunity.findMany.mockResolvedValue([
        { id: 'opp-1', requesterId: 'user-1', title: 'Expired Opp' },
      ]);
      prisma.opportunity.updateMany.mockResolvedValue({ count: 1 });

      await service.expireOpportunities();

      expect(prisma.opportunity.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'CLOSED', closureNote: expect.stringContaining('Auto-closed') } }),
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'auto_expired', actorId: 'system' }),
      );
    });

    it('should do nothing when no opportunities have expired', async () => {
      prisma.opportunity.findMany.mockResolvedValue([]);
      await service.expireOpportunities();
      expect(prisma.opportunity.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('expireBadges', () => {
    it('should update expired badges to EXPIRED status', async () => {
      prisma.trustBadge.updateMany.mockResolvedValue({ count: 3 });
      await service.expireBadges();
      expect(prisma.trustBadge.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'EXPIRED' } }),
      );
    });
  });

  describe('recalculateReputation', () => {
    it('should upsert reputation scores from feedback averages', async () => {
      prisma.engagementFeedback.groupBy.mockResolvedValue([
        { forUserId: 'user-1', _avg: { rating: 4.5 }, _count: { _all: 10 } },
        { forUserId: 'user-2', _avg: { rating: 3.0 }, _count: { _all: 5 } },
      ]);
      prisma.trustRecord.upsert.mockResolvedValue({});

      await service.recalculateReputation();

      expect(prisma.trustRecord.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.trustRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { reputationScore: 4.5, completedEngagements: 10 } }),
      );
    });
  });
});
