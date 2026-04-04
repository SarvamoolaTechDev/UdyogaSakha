import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Optional } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(@Optional() private readonly logger?: AppLogger) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req    = ctx.switchToHttp().getRequest<Request>();
    const res    = ctx.switchToHttp().getResponse<Response>();
    const start  = Date.now();

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        if (this.logger) {
          this.logger.http(req.method, req.url, res.statusCode, ms, req.requestId);
        } else {
          console.log(`${req.method} ${req.url} ${res.statusCode} +${ms}ms`);
        }
      }),
    );
  }
}
