import { Test, TestingModule } from '@nestjs/testing';
import { EngagementsController } from './engagements.controller';
import { EngagementsService } from './engagements.service';
import { ApplicationStatus, EngagementStatus } from '@udyogasakha/types';

const mockService = {
  apply: jest.fn(),
  getMyApplications: jest.fn(),
  getApplicationsForOpportunity: jest.fn(),
  updateApplicationStatus: jest.fn(),
  getMyEngagements: jest.fn(),
  findById: jest.fn(),
  closeEngagement: jest.fn(),
  submitFeedback: jest.fn(),
};

describe('EngagementsController', () => {
  let controller: EngagementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngagementsController],
      providers: [{ provide: EngagementsService, useValue: mockService }],
    }).compile();
    controller = module.get<EngagementsController>(EngagementsController);
    jest.clearAllMocks();
  });

  it('apply() passes opportunityId, userId, and coverMessage', async () => {
    mockService.apply.mockResolvedValue({ id: 'app-1', status: 'PENDING' });
    await controller.apply('provider-id', { opportunityId: 'opp-1', coverMessage: 'I am a fit' });
    expect(mockService.apply).toHaveBeenCalledWith('opp-1', 'provider-id', 'I am a fit');
  });

  it('myApplications() returns applications for current user', async () => {
    mockService.getMyApplications.mockResolvedValue([{ id: 'app-1' }]);
    const result = await controller.myApplications('provider-id');
    expect(mockService.getMyApplications).toHaveBeenCalledWith('provider-id');
    expect(result).toHaveLength(1);
  });

  it('updateApplicationStatus() calls service with id, userId, status', async () => {
    mockService.updateApplicationStatus.mockResolvedValue({ status: 'ACCEPTED' });
    await controller.updateApplicationStatus('app-id', 'requester-id', {
      status: ApplicationStatus.ACCEPTED,
      reviewNote: 'Great',
    });
    expect(mockService.updateApplicationStatus).toHaveBeenCalledWith(
      'app-id', 'requester-id', ApplicationStatus.ACCEPTED, 'Great',
    );
  });

  it('findOne() returns engagement by id', async () => {
    mockService.findById.mockResolvedValue({ id: 'eng-1' });
    const result = await controller.findOne('eng-1', 'user-id');
    expect(mockService.findById).toHaveBeenCalledWith('eng-1');
    expect(result.id).toBe('eng-1');
  });

  it('closeEngagement() passes status and note', async () => {
    mockService.closeEngagement.mockResolvedValue({ status: 'COMPLETED' });
    await controller.closeEngagement('eng-id', 'user-id', {
      status: EngagementStatus.COMPLETED,
      note: 'Well done',
    });
    expect(mockService.closeEngagement).toHaveBeenCalledWith(
      'eng-id', 'user-id', EngagementStatus.COMPLETED, 'Well done',
    );
  });

  it('submitFeedback() passes engagementId, userId, rating, comment', async () => {
    mockService.submitFeedback.mockResolvedValue({ id: 'fb-1' });
    await controller.submitFeedback('eng-id', 'user-id', { rating: 5, comment: 'Excellent' });
    expect(mockService.submitFeedback).toHaveBeenCalledWith('eng-id', 'user-id', 5, 'Excellent');
  });
});
