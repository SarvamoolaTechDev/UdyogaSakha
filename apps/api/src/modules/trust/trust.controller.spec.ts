import { Test, TestingModule } from '@nestjs/testing';
import { TrustController } from './trust.controller';
import { TrustService } from './trust.service';
import { TrustLevel } from '@udyogasakha/types';

const mockTrustService = {
  getTrustSummary: jest.fn(),
  getPendingVerifications: jest.fn(),
  requestDocumentVerification: jest.fn(),
  approveL1: jest.fn(),
  revokeBadge: jest.fn(),
};

describe('TrustController', () => {
  let controller: TrustController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrustController],
      providers: [{ provide: TrustService, useValue: mockTrustService }],
    }).compile();
    controller = module.get<TrustController>(TrustController);
    jest.clearAllMocks();
  });

  it('getMyTrust() returns trust summary for current user', async () => {
    const summary = { userId: 'u1', currentLevel: TrustLevel.L0_REGISTERED, badges: [], reputationScore: 0 };
    mockTrustService.getTrustSummary.mockResolvedValue(summary);
    const result = await controller.getMyTrust('u1');
    expect(mockTrustService.getTrustSummary).toHaveBeenCalledWith('u1');
    expect(result.currentLevel).toBe(TrustLevel.L0_REGISTERED);
  });

  it('getPendingVerifications() calls service method', async () => {
    mockTrustService.getPendingVerifications.mockResolvedValue([{ id: 'req-1' }]);
    const result = await controller.getPendingVerifications();
    expect(result).toHaveLength(1);
  });

  it('requestVerification() delegates to service', async () => {
    mockTrustService.requestDocumentVerification.mockResolvedValue({ id: 'req-1', status: 'pending' });
    const result = await controller.requestVerification('u1', { documentIds: ['doc-1'] });
    expect(mockTrustService.requestDocumentVerification).toHaveBeenCalledWith('u1', ['doc-1']);
    expect(result.status).toBe('pending');
  });

  it('approveL1() delegates with userId and moderatorId', async () => {
    mockTrustService.approveL1.mockResolvedValue(undefined);
    await controller.approveL1('user-id', 'mod-id');
    expect(mockTrustService.approveL1).toHaveBeenCalledWith('user-id', 'mod-id');
  });
});
