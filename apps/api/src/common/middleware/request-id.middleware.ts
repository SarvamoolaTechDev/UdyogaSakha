import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Attaches a unique X-Request-ID to every incoming request.
 * - Reuses X-Request-ID from upstream if present (e.g. from a CDN or load balancer).
 * - Always echoes the request ID back in the response header.
 * - Makes the request ID available on `req.requestId` for use in logs.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers['x-request-id'] as string) ?? randomUUID();
    req.requestId = id;
    res.setHeader('X-Request-ID', id);
    next();
  }
}
