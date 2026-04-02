import { createTestApp, teardownTestApp, TestApp, loginTestUser } from './test-app.helper';
import * as bcrypt from 'bcryptjs';

describe('Engagements (e2e)', () => {
  let t: TestApp;
  let requesterToken: string;
  let providerToken: string;
  let opportunityId: string;
  let applicationId: string;

  beforeAll(async () => {
    t = await createTestApp();

    // Create and activate two users
    const hash = await bcrypt.hash('Test@1234', 12);

    const requester = await t.prisma.user.create({
      data: {
        email: 'eng_e2e_requester@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Requester', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const provider = await t.prisma.user.create({
      data: {
        email: 'eng_e2e_provider@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Provider', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const rLogin = await t.request.post('/api/v1/auth/login').send({ email: requester.email, password: 'Test@1234' });
    const pLogin = await t.request.post('/api/v1/auth/login').send({ email: provider.email, password: 'Test@1234' });
    requesterToken = rLogin.body.data.accessToken;
    providerToken  = pLogin.body.data.accessToken;

    // Create and publish an opportunity directly in DB to skip moderation
    const opp = await t.prisma.opportunity.create({
      data: {
        requesterId: requester.id,
        moduleType: 'EMPLOYMENT_EXCHANGE',
        title: 'E2E Engagement Test Opportunity',
        description: 'Testing the full engagement flow end to end',
        trustLevelRequired: 'L0_REGISTERED',
        status: 'PUBLISHED',
        isPublic: true,
        details: {},
        publishedAt: new Date(),
      },
    });
    opportunityId = opp.id;
  });

  afterAll(async () => { await teardownTestApp(t); });

  describe('POST /api/v1/engagements/apply', () => {
    it('provider can apply to a published opportunity', async () => {
      const res = await t.request
        .post('/api/v1/engagements/apply')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ opportunityId, coverMessage: 'I am an excellent fit' })
        .expect(201);

      expect(res.body.data.status).toBe('PENDING');
      applicationId = res.body.data.id;
    });

    it('cannot apply twice to the same opportunity', async () => {
      await t.request
        .post('/api/v1/engagements/apply')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ opportunityId })
        .expect(409);
    });
  });

  describe('GET /api/v1/engagements/applications/my', () => {
    it('returns provider submitted applications', async () => {
      const res = await t.request
        .get('/api/v1/engagements/applications/my')
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PATCH /api/v1/engagements/applications/:id/status', () => {
    it('requester can accept an application (auto-creates engagement)', async () => {
      const res = await t.request
        .patch(`/api/v1/engagements/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .send({ status: 'ACCEPTED', reviewNote: 'Great profile' })
        .expect(200);

      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('provider cannot update application status', async () => {
      await t.request
        .patch(`/api/v1/engagements/applications/${applicationId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: 'DECLINED' })
        .expect(403);
    });
  });

  describe('GET /api/v1/engagements/my', () => {
    it('returns engagements for both parties', async () => {
      const [rRes, pRes] = await Promise.all([
        t.request.get('/api/v1/engagements/my').set('Authorization', `Bearer ${requesterToken}`),
        t.request.get('/api/v1/engagements/my').set('Authorization', `Bearer ${providerToken}`),
      ]);
      expect(rRes.body.data.length).toBeGreaterThan(0);
      expect(pRes.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/engagements/:id', () => {
    it('returns engagement by id', async () => {
      const listRes = await t.request
        .get('/api/v1/engagements/my')
        .set('Authorization', `Bearer ${requesterToken}`);
      const engId = listRes.body.data[0].id;

      const res = await t.request
        .get(`/api/v1/engagements/${engId}`)
        .set('Authorization', `Bearer ${requesterToken}`)
        .expect(200);
      expect(res.body.data.id).toBe(engId);
    });
  });
});
