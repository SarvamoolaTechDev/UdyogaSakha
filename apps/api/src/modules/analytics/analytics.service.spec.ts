import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe('getOverview', () => {
    it('returns aggregated counts from Prisma', async () => {
      // $transaction returns array of mocked count results
      prisma.$transaction.mockResolvedValue([100, 80, 5, 200, 150, 10, 50, 30, 120, 3]);

      const result = await service.getOverview();

      expect(result.users.total).toBe(100);
      expect(result.users.active).toBe(80);
      expect(result.opportunities.published).toBe(150);
      expect(result.engagements.completed).toBe(30);
      expect(result.moderation.openReports).toBe(3);
    });
  });

  describe('getTrustDistribution', () => {
    it('maps groupBy result to level/count pairs', async () => {
      prisma.trustRecord.groupBy.mockResolvedValue([
        { currentLevel: 'L0_REGISTERED', _count: { _all: 50 } },
        { currentLevel: 'L1_DOCUMENT_VERIFIED', _count: { _all: 30 } },
      ]);

      const result = await service.getTrustDistribution();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ level: 'L0_REGISTERED', count: 50 });
      expect(result[1]).toEqual({ level: 'L1_DOCUMENT_VERIFIED', count: 30 });
    });
  });

  describe('getOpportunitiesByModule', () => {
    it('returns module counts', async () => {
      prisma.opportunity.groupBy.mockResolvedValue([
        { moduleType: 'EMPLOYMENT_EXCHANGE', _count: { _all: 42 } },
      ]);

      const result = await service.getOpportunitiesByModule();
      expect(result[0]).toEqual({ moduleType: 'EMPLOYMENT_EXCHANGE', count: 42 });
    });
  });
});
