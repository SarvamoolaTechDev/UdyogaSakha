import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { mockUser } from '../../test/test-utils';
import { UserRole } from '@udyogasakha/types';

const mockUsersService = {
  findById: jest.fn(),
  updateProfile: jest.fn(),
  search: jest.fn(),
  updateRoles: jest.fn(),
  deleteAccount: jest.fn(),
  sanitize: jest.fn((u) => { const { passwordHash, ...rest } = u; return rest; }),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('returns sanitized current user', async () => {
      const user = mockUser();
      mockUsersService.findById.mockResolvedValue(user);
      const result = await controller.getMe('user-test-id');
      expect(mockUsersService.findById).toHaveBeenCalledWith('user-test-id');
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('updateProfile', () => {
    it('delegates to service.updateProfile', async () => {
      mockUsersService.updateProfile.mockResolvedValue({ fullName: 'Updated' });
      await controller.updateProfile('user-id', { fullName: 'Updated' });
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('user-id', { fullName: 'Updated' });
    });
  });

  describe('list', () => {
    it('returns sanitized user list', async () => {
      const users = [mockUser(), mockUser({ id: 'user-2', email: 'other@test.com' })];
      mockUsersService.search.mockResolvedValue(users);
      const result = await controller.list('test', 50);
      expect(mockUsersService.search).toHaveBeenCalledWith('test', 50);
      expect(result).toHaveLength(2);
      result.forEach((u: any) => expect(u).not.toHaveProperty('passwordHash'));
    });
  });

  describe('updateRoles', () => {
    it('delegates role update to service', async () => {
      mockUsersService.updateRoles.mockResolvedValue({});
      await controller.updateRoles('user-id', { roles: [UserRole.MODERATOR] });
      expect(mockUsersService.updateRoles).toHaveBeenCalledWith('user-id', [UserRole.MODERATOR]);
    });
  });
});
