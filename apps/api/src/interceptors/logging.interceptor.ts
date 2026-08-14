import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

/**
 * Global interceptor that:
 *  1. Assigns a unique X-Request-Id to every request
 *  2. Logs method, path, status code, and processing time
 *  3. Sets X-Process-Time and X-Request-Id response headers
 *
 * Mirrors request logging middleware pattern.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // GraphQL requests don't have Express req/res — skip HTTP logging
    if (context.getType<string>() === 'graphql') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const requestId = uuidv4();
    const startTime = Date.now();

    this.logger.debug(
      `→ ${request.method} ${request.url} [${requestId}]`,
    );

    response.setHeader('X-Request-Id', requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsed = Date.now() - startTime;
          response.setHeader('X-Process-Time', `${elapsed}ms`);
          this.logger.log(
            `← ${request.method} ${request.url} ${response.statusCode} ${elapsed}ms [${requestId}]`,
          );
        },
        error: (err: Error) => {
          const elapsed = Date.now() - startTime;
          this.logger.error(
            `✕ ${request.method} ${request.url} ${elapsed}ms [${requestId}] ${err.message}`,
          );
        },
      }),
    );
  }
}
