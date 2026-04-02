import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { mockOpportunity } from '../../test/test-utils';
import { OpportunityStatus, ModuleType, TrustLevel } from '@udyogasakha/types';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByRequester: jest.fn(),
  getPendingModeration: jest.fn(),
  publish: jest.fn(),
  reject: jest.fn(),
  close: jest.fn(),
};

describe('OpportunitiesController', () => {
  let controller: OpportunitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [{ provide: OpportunitiesService, useValue: mockService }],
    }).compile();
    controller = module.get<OpportunitiesController>(OpportunitiesController);
    jest.clearAllMocks();
  });

  it('create() calls service.create with userId and dto', async () => {
    const opp = mockOpportunity({ status: OpportunityStatus.MODERATION });
    mockService.create.mockResolvedValue(opp);

    const dto = {
      moduleType: ModuleType.EMPLOYMENT_EXCHANGE,
      title: 'Test Opportunity',
      description: 'Long enough description here for the test',
      trustLevelRequired: TrustLevel.L1_DOCUMENT_VERIFIED,
      isPublic: true,
      details: {},
    };

    await controller.create('user-id', dto);
    expect(mockService.create).toHaveBeenCalledWith('user-id', dto);
  });

  it('findAll() returns paginated results', async () => {
    const paginated = { data: [mockOpportunity()], total: 1, page: 1, limit: 20, totalPages: 1 };
    mockService.findAll.mockResolvedValue(paginated);
    const result = await controller.findAll({ page: 1, limit: 20 } as any);
    expect(result).toEqual(paginated);
  });

  it('findMine() returns user own listings', async () => {
    mockService.findByRequester.mockResolvedValue([mockOpportunity()]);
    const result = await controller.findMine('user-id');
    expect(mockService.findByRequester).toHaveBeenCalledWith('user-id');
    expect(result).toHaveLength(1);
  });

  it('publish() calls service.publish with id and moderatorId', async () => {
    mockService.publish.mockResolvedValue(mockOpportunity({ status: OpportunityStatus.PUBLISHED }));
    await controller.publish('opp-id', 'mod-id');
    expect(mockService.publish).toHaveBeenCalledWith('opp-id', 'mod-id');
  });

  it('reject() calls service.reject with reason', async () => {
    mockService.reject.mockResolvedValue(mockOpportunity({ status: OpportunityStatus.REJECTED }));
    await controller.reject('opp-id', 'mod-id', { reason: 'Policy violation' });
    expect(mockService.reject).toHaveBeenCalledWith('opp-id', 'mod-id', 'Policy violation');
  });
});
