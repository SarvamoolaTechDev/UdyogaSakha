import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Applies rate limiting globally.
 * Default: 60 requests per minute per IP (configured in AppModule).
 * Override per endpoint: @Throttle({ default: { limit: 5, ttl: 60000 } })
 * Disable per endpoint: @SkipThrottle()
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Too many requests — please slow down.';
}
