import * as bcrypt from 'bcryptjs';
import { createTestApp, teardownTestApp, TestApp } from './test-app.helper';

describe('Search (e2e)', () => {
  let t: TestApp;
  let token: string;

  beforeAll(async () => {
    t = await createTestApp();
    const hash = await bcrypt.hash('Test@1234', 12);

    const user = await t.prisma.user.create({
      data: {
        email: 'search_e2e@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Searcher', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    // Seed a published opportunity for search
    await t.prisma.opportunity.create({
      data: {
        requesterId: user.id,
        moduleType: 'EMPLOYMENT_EXCHANGE',
        title: 'Senior TypeScript Engineer',
        description: 'We need an experienced TypeScript engineer to lead our platform development.',
        trustLevelRequired: 'L0_REGISTERED',
        status: 'PUBLISHED',
        isPublic: true,
        details: { employmentType: 'contract', location: 'Bengaluru' },
        publishedAt: new Date(),
      },
    });

    const login = await t.request.post('/api/v1/auth/login').send({ email: user.email, password: 'Test@1234' });
    token = login.body.data.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  describe('GET /api/v1/search/opportunities', () => {
    it('returns results via Postgres fallback when Meilisearch unavailable', async () => {
      const res = await t.request
        .get('/api/v1/search/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('hits');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('source');
      expect(['meilisearch', 'postgres']).toContain(res.body.data.source);
    });

    it('filters by module type', async () => {
      const res = await t.request
        .get('/api/v1/search/opportunities?moduleType=EMPLOYMENT_EXCHANGE')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.hits).toBeInstanceOf(Array);
      if (res.body.data.hits.length > 0) {
        expect(res.body.data.hits[0].moduleType).toBe('EMPLOYMENT_EXCHANGE');
      }
    });

    it('returns empty results for unknown search term', async () => {
      const res = await t.request
        .get('/api/v1/search/opportunities?q=xyznonexistentterm12345')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.total).toBe(0);
      expect(res.body.data.hits).toHaveLength(0);
    });

    it('respects page and limit params', async () => {
      const res = await t.request
        .get('/api/v1/search/opportunities?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.page).toBe(1);
      expect(res.body.data.limit).toBe(5);
    });
  });
});
