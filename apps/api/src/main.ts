import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Security
  app.use(helmet());
  app.enableCors({ origin: config.allowedOrigins, credentials: true });

  // Global exception filter — uniform error shape
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // WebSocket adapter (needed for Socket.io gateway)
  const { IoAdapter } = await import('@nestjs/platform-socket.io');
  app.useWebSocketAdapter(new IoAdapter(app));

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger (dev + staging only)
  if (!config.isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('UdyogaSakha API')
      .setDescription('Foundation-governed Udyoga facilitation platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  await app.listen(config.port);
  console.log(`UdyogaSakha API running on port ${config.port} [${config.nodeEnv}]`);
}

bootstrap();
