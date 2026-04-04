import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Strips HTML tags from all string values in the request body.
 * Prevents stored XSS via opportunity descriptions, profile bios, etc.
 * Applied globally before validation pipes run.
 *
 * Note: uses a simple regex — sufficient for our use case.
 * For richer sanitization, swap with the `sanitize-html` package when needed.
 */
function stripTags(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(value)) {
    return value.map(stripTags);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, stripTags(v)]),
    );
  }
  return value;
}

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = stripTags(req.body);
    }
    next();
  }
}
