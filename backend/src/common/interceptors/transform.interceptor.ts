import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  meta?: Record<string, any>;
  timestamp: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has the response format, return as-is
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
          return {
            ...data,
            timestamp: data.timestamp || Date.now(),
          };
        }

        // Extract pagination meta if present
        let meta: Record<string, any> | undefined;
        let responseData = data;

        if (data && typeof data === 'object' && 'items' in data && 'total' in data) {
          const { items, total, page, pageSize } = data;
          responseData = items;
          meta = { total, page, pageSize };
        }

        return {
          code: 0,
          message: 'success',
          data: responseData,
          ...(meta && { meta }),
          timestamp: Date.now(),
        };
      }),
    );
  }
}
