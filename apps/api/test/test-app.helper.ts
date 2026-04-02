import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as request from 'supertest';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  request: ReturnType<typeof request>;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api/v1');
  await app.init();

  const prisma = app.get(PrismaService);

  return { app, prisma, request: request(app.getHttpServer()) };
}

export async function teardownTestApp(testApp: TestApp) {
  await testApp.prisma.cleanDatabase();
  await testApp.app.close();
}

/** Register + login a test user, return access token */
export async function loginTestUser(
  req: ReturnType<typeof request>,
  overrides: Partial<{
    email: string;
    password: string;
    fullName: string;
  }> = {},
): Promise<{ accessToken: string; userId: string }> {
  const email    = overrides.email    ?? `test_${Date.now()}@example.com`;
  const password = overrides.password ?? 'Test@1234';
  const fullName = overrides.fullName ?? 'Test User';

  await req.post('/api/v1/auth/register').send({
    email, password, fullName, participantType: 'INDIVIDUAL',
  });

  const loginRes = await req.post('/api/v1/auth/login').send({ email, password });
  return {
    accessToken: loginRes.body.data.accessToken,
    userId: '', // decoded from JWT in real usage
  };
}
