import { Injectable, LoggerService } from '@nestjs/common';

/**
 * Structured JSON logger.
 * Writes to stdout — log aggregator (Datadog, CloudWatch, etc.) picks up from there.
 * Wire up a real Winston transport when hosting provider is decided.
 *
 * Usage in NestJS:
 *   app.useLogger(app.get(AppLogger));
 *
 * Usage in services:
 *   @Inject(AppLogger) private readonly logger: AppLogger
 *   this.logger.log('message', 'ContextName', { extraField: 'value' })
 */
@Injectable()
export class AppLogger implements LoggerService {
  private readonly env = process.env.NODE_ENV ?? 'development';
  private readonly isProduction = this.env === 'production';

  private write(level: string, message: unknown, context?: string, meta?: Record<string, unknown>) {
    const entry = {
      ts: new Date().toISOString(),
      level,
      ctx: context,
      msg: message,
      ...meta,
    };

    // In production: emit JSON for log aggregators
    // In development: pretty-print for readability
    if (this.isProduction) {
      process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
      const prefix = `[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}`;
      const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
      console.log(`${prefix}${message}${metaStr}`);
    }
  }

  log(message: unknown, context?: string, meta?: Record<string, unknown>) {
    this.write('info', message, context, meta);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write('error', message, context, { trace });
  }

  warn(message: unknown, context?: string) {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string) {
    if (!this.isProduction) this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string) {
    if (!this.isProduction) this.write('verbose', message, context);
  }

  /** Log an HTTP request — called by LoggingInterceptor */
  http(method: string, url: string, statusCode: number, ms: number, requestId?: string) {
    this.write('http', `${method} ${url} ${statusCode} +${ms}ms`, 'HTTP', { requestId, statusCode, ms });
  }
}
