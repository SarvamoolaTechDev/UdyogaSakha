import * as bcrypt from 'bcryptjs';
import { createTestApp, teardownTestApp, TestApp } from './test-app.helper';

describe('Notifications (e2e)', () => {
  let t: TestApp;
  let userToken: string;
  let userId: string;
  let notificationId: string;

  beforeAll(async () => {
    t = await createTestApp();
    const hash = await bcrypt.hash('Test@1234', 12);

    const user = await t.prisma.user.create({
      data: {
        email: 'notif_e2e@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: {
          create: { fullName: 'Notif User', participantType: 'INDIVIDUAL', showContactAfterMatch: false },
        },
        trustRecord: {
          create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 },
        },
      },
    });
    userId = user.id;

    // Seed a notification directly
    await t.prisma.notification.create({
      data: { userId, subject: 'Test notification', body: 'E2E test notification body', read: false },
    });
    // Seed a second one
    await t.prisma.notification.create({
      data: { userId, subject: 'Second notification', body: 'Another notification', read: false },
    });

    const login = await t.request.post('/api/v1/auth/login').send({ email: user.email, password: 'Test@1234' });
    userToken = login.body.data.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  describe('GET /api/v1/notifications', () => {
    it('returns all notifications for the current user', async () => {
      const res = await t.request
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      notificationId = res.body.data[0].id;
    });

    it('returns 401 without auth', async () => {
      await t.request.get('/api/v1/notifications').expect(401);
    });

    it('filters to unread only with ?unread=true', async () => {
      const res = await t.request
        .get('/api/v1/notifications?unread=true')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data.every((n: any) => n.read === false)).toBe(true);
    });
  });

  describe('GET /api/v1/notifications/unread-count', () => {
    it('returns count of unread notifications', async () => {
      const res = await t.request
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('count');
      expect(typeof res.body.data.count).toBe('number');
      expect(res.body.data.count).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('marks a single notification as read', async () => {
      await t.request
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify in DB
      const notif = await t.prisma.notification.findFirst({
        where: { id: notificationId },
      });
      expect(notif?.read).toBe(true);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('marks all notifications as read', async () => {
      await t.request
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify unread count is now 0
      const res = await t.request
        .get('/api/v1/notifications/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.body.data.count).toBe(0);
    });
  });
});
