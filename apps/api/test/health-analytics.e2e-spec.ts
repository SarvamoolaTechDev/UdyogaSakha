import { createTestApp, teardownTestApp, TestApp, loginTestUser } from './test-app.helper';

describe('Health (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => { t = await createTestApp(); });
  afterAll(async () => { await teardownTestApp(t); });

  it('GET /api/v1/health returns ok', async () => {
    const res = await t.request.get('/api/v1/health').expect(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/v1/health/ready returns ready with db connected', async () => {
    const res = await t.request.get('/api/v1/health/ready').expect(200);
    expect(res.body.data.db).toBe('connected');
  });
});

describe('Analytics (e2e)', () => {
  let t: TestApp;
  let adminToken: string;
  let participantToken: string;

  beforeAll(async () => {
    t = await createTestApp();

    // Seed an admin user directly in DB
    const bcrypt = await import('bcryptjs');
    await t.prisma.user.create({
      data: {
        email: 'analytics_admin@e2e.com',
        passwordHash: await bcrypt.hash('Admin@1234', 12),
        roles: ['ADMIN'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Analytics Admin', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const adminLogin = await t.request.post('/api/v1/auth/login').send({ email: 'analytics_admin@e2e.com', password: 'Admin@1234' });
    adminToken = adminLogin.body.data.accessToken;

    const p = await loginTestUser(t.request);
    participantToken = p.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  it('GET /api/v1/analytics/overview returns stats for admin', async () => {
    const res = await t.request
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('opportunities');
    expect(res.body.data).toHaveProperty('engagements');
  });

  it('GET /api/v1/analytics/overview returns 403 for participant', async () => {
    await t.request
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${participantToken}`)
      .expect(403);
  });

  it('GET /api/v1/analytics/trust-distribution returns array', async () => {
    const res = await t.request
      .get('/api/v1/analytics/trust-distribution')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('GET /api/v1/analytics/weekly-activity returns array', async () => {
    const res = await t.request
      .get('/api/v1/analytics/weekly-activity')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});
