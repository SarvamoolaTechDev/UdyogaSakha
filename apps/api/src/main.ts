import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfigService } from './config/app-config.service';
import { AppLogger } from './common/logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get(AppConfigService);
  const logger = app.get(AppLogger);

  // Use structured logger for NestJS bootstrap messages
  app.useLogger(logger);

  // Security
  app.use(helmet());
  app.enableCors({ origin: config.allowedOrigins, credentials: true });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // WebSocket adapter
  const { IoAdapter } = await import('@nestjs/platform-socket.io');
  app.useWebSocketAdapter(new IoAdapter(app));

  app.setGlobalPrefix('api/v1');

  if (!config.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('UdyogaSakha API')
      .setDescription('Foundation-governed Udyoga facilitation platform — v1')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Registration, login, token management')
      .addTag('Users', 'Profile management and account operations')
      .addTag('Trust', 'Trust framework — L0–L4 levels, badges, screening')
      .addTag('Opportunities', 'Opportunity lifecycle across all 9 modules')
      .addTag('Engagements', 'Applications, matching, feedback')
      .addTag('Moderation', 'Reports and enforcement actions')
      .addTag('Governance', 'EGC/DEP council management')
      .addTag('Notifications', 'In-app and push notifications')
      .addTag('Analytics', 'Platform statistics — admin only')
      .addTag('Search', 'Full-text opportunity search')
      .addTag('Audit', 'Immutable audit log — admin only')
      .addTag('Health', 'Liveness and readiness probes')
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  // Serve uploaded documents locally (Phase 2: replace with CDN/presigned URLs)
  if (!config.isProduction) {
    const { join } = await import('path');
    const { NestExpressApplication } = await import('@nestjs/platform-express');
    (app as any).useStaticAssets?.(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  }

  await app.listen(config.port);
  logger.log(`API running on port ${config.port} [${config.nodeEnv}]`, 'Bootstrap');
}

bootstrap();
