import { createTestApp, teardownTestApp, TestApp } from './test-app.helper';

describe('Auth (e2e)', () => {
  let t: TestApp;

  beforeAll(async () => { t = await createTestApp(); });
  afterAll(async () => { await teardownTestApp(t); });

  const creds = {
    email: 'auth_e2e@example.com',
    password: 'Test@1234',
    fullName: 'Auth E2E User',
    participantType: 'INDIVIDUAL',
  };

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and returns tokens', async () => {
      const res = await t.request.post('/api/v1/auth/register').send(creds).expect(201);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
    });

    it('rejects duplicate email with 409', async () => {
      await t.request.post('/api/v1/auth/register').send(creds).expect(409);
    });

    it('rejects weak password with 400', async () => {
      await t.request.post('/api/v1/auth/register').send({ ...creds, email: 'other@e.com', password: 'weak' }).expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns tokens for valid credentials', async () => {
      const res = await t.request.post('/api/v1/auth/login').send({ email: creds.email, password: creds.password }).expect(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('returns 401 for wrong password', async () => {
      await t.request.post('/api/v1/auth/login').send({ email: creds.email, password: 'Wrong@pass1' }).expect(401);
    });

    it('returns 401 for unknown email', async () => {
      await t.request.post('/api/v1/auth/login').send({ email: 'nobody@example.com', password: 'Test@1234' }).expect(401);
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('returns current user when authenticated', async () => {
      const loginRes = await t.request.post('/api/v1/auth/login').send({ email: creds.email, password: creds.password });
      const token = loginRes.body.data.accessToken;

      const res = await t.request
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.email).toBe(creds.email);
      expect(res.body.data).not.toHaveProperty('passwordHash');
    });

    it('returns 401 without token', async () => {
      await t.request.get('/api/v1/users/me').expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('logs out and revokes refresh tokens', async () => {
      const loginRes = await t.request.post('/api/v1/auth/login').send({ email: creds.email, password: creds.password });
      const token = loginRes.body.data.accessToken;

      await t.request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
