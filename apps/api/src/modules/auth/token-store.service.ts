import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class TokenStoreService {
  private readonly logger = new Logger(TokenStoreService.name);
  private client!: RedisClientType;
  private connected = false;

  // Prefix all keys so they're easy to scan/flush in tooling
  private readonly PREFIX = 'udyoga:rt:';
  private readonly REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    try {
      this.client = createClient({ url: this.config.get('REDIS_URL', 'redis://localhost:6379') }) as any;
      this.client.on('error', (err) => this.logger.warn('Redis error', err));
      await (this.client as any).connect();
      this.connected = true;
      this.logger.log('Redis token store connected');
    } catch {
      this.logger.warn('Redis unavailable — refresh token rotation disabled');
    }
  }

  async onModuleDestroy() {
    if (this.connected) await (this.client as any).quit();
  }

  /** Store a refresh token hash for a user. Old tokens for the same user are NOT invalidated
   *  here — call revokeAll() on explicit logout. */
  async store(userId: string, tokenHash: string): Promise<void> {
    if (!this.connected) return;
    const key = `${this.PREFIX}${userId}:${tokenHash}`;
    await (this.client as any).set(key, '1', { EX: this.REFRESH_TTL_SECONDS });
  }

  /** Check if a refresh token hash is still valid (not revoked) */
  async isValid(userId: string, tokenHash: string): Promise<boolean> {
    if (!this.connected) return true; // fail open if Redis is down
    const key = `${this.PREFIX}${userId}:${tokenHash}`;
    const val = await (this.client as any).get(key);
    return val === '1';
  }

  /** Revoke a specific refresh token (e.g. after rotation — old token is consumed) */
  async revoke(userId: string, tokenHash: string): Promise<void> {
    if (!this.connected) return;
    const key = `${this.PREFIX}${userId}:${tokenHash}`;
    await (this.client as any).del(key);
  }

  /** Revoke ALL refresh tokens for a user — used on explicit logout */
  async revokeAll(userId: string): Promise<void> {
    if (!this.connected) return;
    const pattern = `${this.PREFIX}${userId}:*`;
    const keys: string[] = await (this.client as any).keys(pattern);
    if (keys.length > 0) await (this.client as any).del(keys);
  }
}
