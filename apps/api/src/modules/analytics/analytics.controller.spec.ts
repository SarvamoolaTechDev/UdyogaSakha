import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

const mockService = {
  getOverview: jest.fn(),
  getTrustDistribution: jest.fn(),
  getOpportunitiesByModule: jest.fn(),
  getWeeklyActivity: jest.fn(),
  getGovernanceHealth: jest.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).compile();
    controller = module.get<AnalyticsController>(AnalyticsController);
    jest.clearAllMocks();
  });

  it('getOverview() returns platform overview stats', async () => {
    const overview = {
      users: { total: 100, active: 80, pendingVerification: 5 },
      opportunities: { total: 200, published: 150, pendingModeration: 10 },
    };
    mockService.getOverview.mockResolvedValue(overview);
    const result = await controller.getOverview();
    expect(result.users.total).toBe(100);
    expect(mockService.getOverview).toHaveBeenCalledTimes(1);
  });

  it('getTrustDistribution() returns level/count array', async () => {
    mockService.getTrustDistribution.mockResolvedValue([
      { level: 'L0_REGISTERED', count: 50 },
    ]);
    const result = await controller.getTrustDistribution();
    expect(result).toHaveLength(1);
    expect(result[0].level).toBe('L0_REGISTERED');
  });

  it('getByModule() returns module counts', async () => {
    mockService.getOpportunitiesByModule.mockResolvedValue([
      { moduleType: 'EMPLOYMENT_EXCHANGE', count: 42 },
    ]);
    const result = await controller.getByModule();
    expect(result[0].count).toBe(42);
  });

  it('getWeeklyActivity() returns weekly buckets', async () => {
    mockService.getWeeklyActivity.mockResolvedValue([
      { week: '2024-01-01', newUsers: 10, newOpportunities: 5 },
    ]);
    const result = await controller.getWeeklyActivity();
    expect(result[0].newUsers).toBe(10);
  });

  it('getGovernanceHealth() returns health indicators', async () => {
    mockService.getGovernanceHealth.mockResolvedValue({
      activeMembers: 8, pendingReports: 2, recentEnforcements: 1,
    });
    const result = await controller.getGovernanceHealth();
    expect(result.activeMembers).toBe(8);
  });
});
