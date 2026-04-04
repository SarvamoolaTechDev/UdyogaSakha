import * as bcrypt from 'bcryptjs';
import { createTestApp, teardownTestApp, TestApp } from './test-app.helper';
import { EnforcementActionType } from '@udyogasakha/types';

describe('Moderation (e2e)', () => {
  let t: TestApp;
  let participantToken: string;
  let moderatorToken: string;
  let targetUserId: string;
  let reportId: string;

  beforeAll(async () => {
    t = await createTestApp();
    const hash = await bcrypt.hash('Test@1234', 12);

    const target = await t.prisma.user.create({
      data: {
        email: 'mod_e2e_target@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Target User', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });
    targetUserId = target.id;

    const participant = await t.prisma.user.create({
      data: {
        email: 'mod_e2e_reporter@test.com',
        passwordHash: hash,
        roles: ['PARTICIPANT'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Reporter', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L0_REGISTERED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const moderator = await t.prisma.user.create({
      data: {
        email: 'mod_e2e_mod@test.com',
        passwordHash: hash,
        roles: ['MODERATOR'],
        status: 'ACTIVE',
        profile: { create: { fullName: 'Mod', participantType: 'INDIVIDUAL', showContactAfterMatch: false } },
        trustRecord: { create: { currentLevel: 'L1_DOCUMENT_VERIFIED', reputationScore: 0, completedEngagements: 0 } },
      },
    });

    const pLogin = await t.request.post('/api/v1/auth/login').send({ email: participant.email, password: 'Test@1234' });
    const mLogin = await t.request.post('/api/v1/auth/login').send({ email: moderator.email, password: 'Test@1234' });
    participantToken = pLogin.body.data.accessToken;
    moderatorToken   = mLogin.body.data.accessToken;
  });

  afterAll(async () => { await teardownTestApp(t); });

  describe('POST /api/v1/moderation/reports', () => {
    it('participant can submit a report', async () => {
      const res = await t.request
        .post('/api/v1/moderation/reports')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({
          subjectType: 'user',
          subjectId: targetUserId,
          reason: 'Inappropriate conduct',
          detail: 'User sent abusive messages outside the platform',
        })
        .expect(201);

      expect(res.body.data.status).toBe('pending');
      reportId = res.body.data.id;
    });
  });

  describe('GET /api/v1/moderation/reports/pending', () => {
    it('moderator can view pending reports', async () => {
      const res = await t.request
        .get('/api/v1/moderation/reports/pending')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('participant cannot view pending reports', async () => {
      await t.request
        .get('/api/v1/moderation/reports/pending')
        .set('Authorization', `Bearer ${participantToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/moderation/reports/:id/resolve', () => {
    it('moderator can resolve a report', async () => {
      const res = await t.request
        .patch(`/api/v1/moderation/reports/${reportId}/resolve`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ resolution: 'Reviewed — warning issued to user' })
        .expect(200);
      expect(res.body.data.status).toBe('resolved');
    });

    it('returns 404 for unknown report', async () => {
      await t.request
        .patch('/api/v1/moderation/reports/00000000-0000-0000-0000-000000000000/resolve')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ resolution: 'na' })
        .expect(404);
    });
  });

  describe('POST /api/v1/moderation/enforce', () => {
    it('moderator can apply a WARNING action', async () => {
      const res = await t.request
        .post('/api/v1/moderation/enforce')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          targetUserId,
          action: EnforcementActionType.WARNING,
          reason: 'First offence — policy reminder issued',
        })
        .expect(201);
      expect(res.body.data.action).toBe(EnforcementActionType.WARNING);
    });

    it('RESTRICT action updates user status in DB', async () => {
      await t.request
        .post('/api/v1/moderation/enforce')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ targetUserId, action: EnforcementActionType.RESTRICT, reason: 'Repeated violations' })
        .expect(201);

      const user = await t.prisma.user.findUnique({ where: { id: targetUserId } });
      expect(user?.status).toBe('RESTRICTED');
    });

    it('participant cannot enforce actions', async () => {
      await t.request
        .post('/api/v1/moderation/enforce')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ targetUserId, action: EnforcementActionType.WARNING, reason: 'self-service' })
        .expect(403);
    });
  });
});
