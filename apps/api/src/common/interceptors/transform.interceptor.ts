import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

/**
 * Wraps every successful response in:
 * { data: <original payload>, statusCode: <http status>, timestamp: <iso> }
 *
 * Errors are NOT touched — they go through AllExceptionsFilter directly.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const statusCode = ctx.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
