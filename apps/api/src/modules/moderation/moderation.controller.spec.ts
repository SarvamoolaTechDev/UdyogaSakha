import { Test, TestingModule } from '@nestjs/testing';
import { ModerationController } from './moderation.controller';
import { ModerationService } from './moderation.service';
import { EnforcementActionType } from '@udyogasakha/types';

const mockService = {
  submitReport: jest.fn(),
  getPendingReports: jest.fn(),
  resolveReport: jest.fn(),
  enforce: jest.fn(),
  getEnforcementHistory: jest.fn(),
};

describe('ModerationController', () => {
  let controller: ModerationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationController],
      providers: [{ provide: ModerationService, useValue: mockService }],
    }).compile();
    controller = module.get<ModerationController>(ModerationController);
    jest.clearAllMocks();
  });

  it('submitReport() delegates to service with all fields', async () => {
    mockService.submitReport.mockResolvedValue({ id: 'report-1', status: 'pending' });
    await controller.submitReport('reporter-id', {
      subjectType: 'user', subjectId: 'target-id',
      reason: 'harassment', detail: 'repeated messages',
    });
    expect(mockService.submitReport).toHaveBeenCalledWith(
      'reporter-id', 'user', 'target-id', 'harassment', 'repeated messages',
    );
  });

  it('getPendingReports() returns pending queue', async () => {
    mockService.getPendingReports.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
    const result = await controller.getPendingReports();
    expect(result).toHaveLength(2);
  });

  it('resolveReport() passes resolution to service', async () => {
    mockService.resolveReport.mockResolvedValue({ id: 'r1', status: 'resolved' });
    const result = await controller.resolveReport('r1', 'mod-id', { resolution: 'Warning issued' });
    expect(mockService.resolveReport).toHaveBeenCalledWith('r1', 'mod-id', 'Warning issued');
    expect(result.status).toBe('resolved');
  });

  it('enforce() dispatches action with expiry', async () => {
    mockService.enforce.mockResolvedValue({ id: 'enf-1' });
    await controller.enforce('mod-id', {
      targetUserId: 'user-id',
      action: EnforcementActionType.RESTRICT,
      reason: 'policy violation',
      expiresAt: '2025-12-31T00:00:00Z',
    });
    expect(mockService.enforce).toHaveBeenCalledWith(
      'user-id', EnforcementActionType.RESTRICT, 'policy violation', 'mod-id',
      new Date('2025-12-31T00:00:00Z'),
    );
  });

  it('getEnforcementHistory() delegates userId to service', async () => {
    mockService.getEnforcementHistory.mockResolvedValue([]);
    await controller.getEnforcementHistory('user-id');
    expect(mockService.getEnforcementHistory).toHaveBeenCalledWith('user-id');
  });
});
