import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { CouncilType } from '@udyogasakha/types';

const mockService = {
  getActiveMembers: jest.fn(),
  addMember: jest.fn(),
  deactivateMember: jest.fn(),
  declareConflict: jest.fn(),
  scheduleScreeningSession: jest.fn(),
  recordSessionOutcome: jest.fn(),
  getConflictDeclarations: jest.fn(),
  getSessions: jest.fn(),
};

describe('GovernanceController', () => {
  let controller: GovernanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GovernanceController],
      providers: [{ provide: GovernanceService, useValue: mockService }],
    }).compile();
    controller = module.get<GovernanceController>(GovernanceController);
    jest.clearAllMocks();
  });

  it('getMembers() filters by councilType when provided', async () => {
    mockService.getActiveMembers.mockResolvedValue([{ id: 'm-1', councilType: CouncilType.DEP }]);
    await controller.getMembers(CouncilType.DEP);
    expect(mockService.getActiveMembers).toHaveBeenCalledWith(CouncilType.DEP);
  });

  it('addMember() passes all fields and adminId', async () => {
    mockService.addMember.mockResolvedValue({ id: 'm-1', active: true });
    const result = await controller.addMember('admin-id', {
      userId: 'user-id', councilType: CouncilType.EGC, domain: 'Finance',
    });
    expect(mockService.addMember).toHaveBeenCalledWith('user-id', CouncilType.EGC, 'Finance', 'admin-id');
    expect(result.active).toBe(true);
  });

  it('declareConflict() registers current member as declarer', async () => {
    mockService.declareConflict.mockResolvedValue({ id: 'coi-1' });
    await controller.declareConflict('member-id', {
      entityId: 'candidate-id', entityType: 'user', notes: 'Know this person personally',
    });
    expect(mockService.declareConflict).toHaveBeenCalledWith(
      'member-id', 'candidate-id', 'user', 'Know this person personally',
    );
  });

  it('scheduleSession() passes date and domain', async () => {
    const dt = '2025-06-01T10:00:00Z';
    mockService.scheduleScreeningSession.mockResolvedValue({ id: 'sess-1', status: 'scheduled' });
    await controller.scheduleSession('panel-id', { candidateId: 'cand-id', scheduledAt: dt, domain: 'IT' });
    expect(mockService.scheduleScreeningSession).toHaveBeenCalledWith(
      'cand-id', 'panel-id', new Date(dt), 'IT',
    );
  });

  it('recordOutcome() passes outcome and notes', async () => {
    mockService.recordSessionOutcome.mockResolvedValue({ id: 'sess-1', outcome: 'approved' });
    const result = await controller.recordOutcome('sess-1', 'panel-id', {
      outcome: 'approved', notes: 'Excellent screening',
    });
    expect(result.outcome).toBe('approved');
  });

  it('getMemberConflicts() returns declarations for memberId', async () => {
    mockService.getConflictDeclarations.mockResolvedValue([{ id: 'coi-1' }]);
    const result = await controller.getMemberConflicts('member-id');
    expect(mockService.getConflictDeclarations).toHaveBeenCalledWith('member-id');
    expect(result).toHaveLength(1);
  });
});
