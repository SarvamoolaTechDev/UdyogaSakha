import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  // ── Database ─────────────────────────────────────────────────────────────
  get databaseUrl(): string {
    return this.config.getOrThrow<string>('DATABASE_URL');
  }

  // ── Redis ─────────────────────────────────────────────────────────────────
  get redisUrl(): string {
    return this.config.get<string>('REDIS_URL', 'redis://localhost:6379');
  }

  // ── JWT ──────────────────────────────────────────────────────────────────
  get jwtSecret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN', '15m');
  }

  get jwtRefreshSecret(): string {
    return this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiresIn(): string {
    return this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  // ── Meilisearch ───────────────────────────────────────────────────────────
  get meilisearchHost(): string {
    return this.config.get<string>('MEILISEARCH_HOST', 'http://localhost:7700');
  }

  get meilisearchApiKey(): string {
    return this.config.get<string>('MEILISEARCH_API_KEY', '');
  }

  // ── Storage ───────────────────────────────────────────────────────────────
  get storageEndpoint(): string | undefined {
    return this.config.get<string>('STORAGE_ENDPOINT');
  }

  get storageBucket(): string | undefined {
    return this.config.get<string>('STORAGE_BUCKET');
  }

  // ── CORS ─────────────────────────────────────────────────────────────────
  get allowedOrigins(): string[] {
    const raw = this.config.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000');
    return raw.split(',').map((o) => o.trim());
  }
}
