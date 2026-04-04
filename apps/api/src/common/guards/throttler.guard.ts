import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

/**
 * Rate limiting guard with two layers:
 *  1. Per-IP  — 60 requests / minute (global default)
 *  2. Per-User — 120 requests / minute for authenticated users (more lenient)
 *
 * Override per endpoint:
 *   @Throttle({ default: { limit: 5, ttl: 60_000 } })
 *
 * Disable per endpoint:
 *   @SkipThrottle()
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Too many requests — please slow down.';

  protected async getTracker(req: Request): Promise<string> {
    // Authenticated users get their own per-user bucket
    const userId = (req as any).user?.id;
    if (userId) return `user:${userId}`;
    // Fall back to IP for unauthenticated requests
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: any,
    storage: any,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const userId = (req as any).user?.id;

    // Authenticated users get a 2× allowance
    const effectiveLimit = userId ? limit * 2 : limit;

    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker, throttler.name);
    const { totalHits } = await storage.increment(key, ttl);

    if (totalHits > effectiveLimit) {
      throw new ThrottlerException(this.errorMessage);
    }
    return true;
  }
}
