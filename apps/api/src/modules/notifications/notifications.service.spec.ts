import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { createMockPrisma } from '../../test/test-utils';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(async () => {
    prisma = createMockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('send — in_app channel', () => {
    it('should persist notification to DB', async () => {
      prisma.notification.create.mockResolvedValue({ id: 'notif-1', read: false });

      await service.send({
        userId: 'user-1',
        channel: 'in_app',
        subject: 'Test',
        body: 'Test notification',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-1', body: 'Test notification' }),
        }),
      );
    });

    it('should not throw if DB fails (fire-and-forget semantics)', async () => {
      prisma.notification.create.mockRejectedValue(new Error('DB error'));
      await expect(
        service.send({ userId: 'user-1', channel: 'in_app', body: 'test' }),
      ).resolves.not.toThrow();
    });
  });

  describe('getUnread', () => {
    it('should return unread notifications for user', async () => {
      prisma.notification.findMany.mockResolvedValue([
        { id: 'n1', read: false, body: 'notification 1' },
      ]);
      const result = await service.getUnread('user-1');
      expect(result).toHaveLength(1);
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', read: false } }),
      );
    });
  });

  describe('markAllRead', () => {
    it('should update all unread notifications', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });
      await service.markAllRead('user-1');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1', read: false }, data: { read: true } }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(5);
      const result = await service.getUnreadCount('user-1');
      expect(result).toBe(5);
    });
  });
});
