import { createTestApp, teardownTestApp, TestApp, loginTestUser } from './test-app.helper';

describe('Opportunities (e2e)', () => {
  let t: TestApp;
  let token: string;
  let createdOppId: string;

  beforeAll(async () => {
    t = await createTestApp();
    const auth = await loginTestUser(t.request);
    token = auth.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  const oppPayload = {
    moduleType: 'EMPLOYMENT_EXCHANGE',
    title: 'Senior TypeScript Developer',
    description: 'We are looking for an experienced TypeScript developer to join our team on a contract basis.',
    trustLevelRequired: 'L1_DOCUMENT_VERIFIED',
    isPublic: true,
    details: { employmentType: 'contract', industry: 'Technology', location: 'Bengaluru', isRemote: true },
  };

  describe('POST /api/v1/opportunities', () => {
    it('creates an opportunity (enters MODERATION)', async () => {
      const res = await t.request
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send(oppPayload)
        .expect(201);

      expect(res.body.data.status).toBe('MODERATION');
      expect(res.body.data.title).toBe(oppPayload.title);
      createdOppId = res.body.data.id;
    });

    it('rejects short title with 400', async () => {
      await t.request
        .post('/api/v1/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...oppPayload, title: 'Hi' })
        .expect(400);
    });

    it('requires auth — returns 401', async () => {
      await t.request.post('/api/v1/opportunities').send(oppPayload).expect(401);
    });
  });

  describe('GET /api/v1/opportunities', () => {
    it('returns only PUBLISHED opportunities (empty at this point)', async () => {
      const res = await t.request
        .get('/api/v1/opportunities')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.data).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/v1/opportunities/my', () => {
    it('returns requester own listings', async () => {
      const res = await t.request
        .get('/api/v1/opportunities/my')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].title).toBe(oppPayload.title);
    });
  });

  describe('GET /api/v1/opportunities/:id', () => {
    it('returns opportunity by id', async () => {
      const res = await t.request
        .get(`/api/v1/opportunities/${createdOppId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.id).toBe(createdOppId);
    });

    it('returns 404 for unknown id', async () => {
      await t.request
        .get('/api/v1/opportunities/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/opportunities/:id/close', () => {
    it('allows requester to close their opportunity', async () => {
      const res = await t.request
        .patch(`/api/v1/opportunities/${createdOppId}/close`)
        .set('Authorization', `Bearer ${token}`)
        .send({ note: 'Filled internally' })
        .expect(200);
      expect(res.body.data.status).toBe('CLOSED');
    });
  });
});
