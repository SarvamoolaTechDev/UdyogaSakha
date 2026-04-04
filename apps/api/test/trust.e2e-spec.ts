import * as bcrypt from 'bcryptjs';
import { createTestApp, teardownTestApp, TestApp } from './test-app.helper';

describe('Trust (e2e)', () => {
  let t: TestApp;
  let participantToken: string;
  let moderatorToken: string;
  let participantId: string;

  beforeAll(async () => {
    t = await createTestApp();
    const hash = await bcrypt.hash('Test@1234', 12);

    const participant = await t.prisma.user.create({
      data: {
        email: 'trust_e2e_user@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Trust E2E User', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });
    participantId = participant.id;

    const moderator = await t.prisma.user.create({
      data: {
        email: 'trust_e2e_mod@test.com',
        passwordHash: hash,
        roles: ['MODERATOR'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Trust Moderator', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L1_DOCUMENT_VERIFIED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const pLogin = await t.request.post('/api/v1/auth/login').send({ email: participant.email, password: 'Test@1234' });
    const mLogin = await t.request.post('/api/v1/auth/login').send({ email: moderator.email, password: 'Test@1234' });
    participantToken = pLogin.body.data.accessToken;
    moderatorToken   = mLogin.body.data.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  describe('GET /api/v1/trust/me', () => {
    it('returns L0 trust summary for new user', async () => {
      const res = await t.request
        .get('/api/v1/trust/me')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(200);
      expect(res.body.data.currentLevel).toBe('L0_REGISTERED');
      expect(res.body.data.badges).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/trust/request-verification', () => {
    it('creates a pending verification request', async () => {
      // First upload a mock document id
      const res = await t.request
        .post('/api/v1/trust/request-verification')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ documentIds: ['doc-mock-001', 'doc-mock-002'] })
        .expect(201);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.documentIds).toHaveLength(2);
    });

    it('rejects if already at L1 or higher', async () => {
      // Elevate user first
      await t.prisma.trustRecord.update({
        where: { userId: participantId },
        data: { currentLevel: 'L1_DOCUMENT_VERIFIED' },
      });

      await t.request
        .post('/api/v1/trust/request-verification')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ documentIds: ['doc-003'] })
        .expect(400);

      // Reset
      await t.prisma.trustRecord.update({
        where: { userId: participantId },
        data: { currentLevel: 'L0_REGISTERED' },
      });
    });
  });

  describe('GET /api/v1/trust/verifications/pending', () => {
    it('returns pending verifications for moderator', async () => {
      const res = await t.request
        .get('/api/v1/trust/verifications/pending')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('returns 403 for regular participant', async () => {
      await t.request
        .get('/api/v1/trust/verifications/pending')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/trust/:userId/approve-l1', () => {
    it('moderator can approve L1 for an L0 user', async () => {
      // Reset to L0 first
      await t.prisma.trustRecord.update({
        where: { userId: participantId },
        data: { currentLevel: 'L0_REGISTERED' },
      });

      await t.request
        .post(`/api/v1/trust/${participantId}/approve-l1`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(201);

      // Verify level was elevated
      const trust = await t.prisma.trustRecord.findUnique({ where: { userId: participantId } });
      expect(trust?.currentLevel).toBe('L1_DOCUMENT_VERIFIED');
    });

    it('returns 403 for regular participant', async () => {
      await t.request
        .post(`/api/v1/trust/${participantId}/approve-l1`)
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });
});
