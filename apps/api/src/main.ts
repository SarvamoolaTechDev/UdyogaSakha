import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Security
  app.use(helmet());
  app.enableCors({ origin: config.allowedOrigins, credentials: true });

  // Global exception filter — uniform error shape
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe — strips unknown fields, validates all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
