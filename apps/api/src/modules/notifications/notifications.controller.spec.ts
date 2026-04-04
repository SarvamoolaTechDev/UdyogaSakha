import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockService = {
  getAll: jest.fn(),
  getUnread: jest.fn(),
  getUnreadCount: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockService }],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns all notifications when unread param is absent', async () => {
      mockService.getAll.mockResolvedValue([{ id: 'n1' }, { id: 'n2' }]);
      const result = await controller.getAll('user-id');
      expect(mockService.getAll).toHaveBeenCalledWith('user-id');
      expect(result).toHaveLength(2);
    });

    it('returns only unread when unread=true', async () => {
      mockService.getUnread.mockResolvedValue([{ id: 'n1', read: false }]);
      const result = await controller.getAll('user-id', 'true');
      expect(mockService.getUnread).toHaveBeenCalledWith('user-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('getUnreadCount', () => {
    it('wraps count in an object', async () => {
      mockService.getUnreadCount.mockResolvedValue(7);
      const result = await controller.getUnreadCount('user-id');
      expect(result).toEqual({ count: 7 });
    });
  });

  describe('markRead', () => {
    it('delegates to service.markRead with notificationId and userId', async () => {
      mockService.markRead.mockResolvedValue({ count: 1 });
      await controller.markRead('notif-id', 'user-id');
      expect(mockService.markRead).toHaveBeenCalledWith('notif-id', 'user-id');
    });
  });

  describe('markAllRead', () => {
    it('delegates to service.markAllRead', async () => {
      mockService.markAllRead.mockResolvedValue({ count: 5 });
      await controller.markAllRead('user-id');
      expect(mockService.markAllRead).toHaveBeenCalledWith('user-id');
    });
  });
});
