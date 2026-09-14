import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res) => {
        // Se a resposta já possui estrutura { data, meta } ou for stream/buffer (ex: exportação), retorna direto
        if (
          res &&
          (res.data !== undefined ||
            Buffer.isBuffer(res) ||
            res instanceof Uint8Array ||
            res?.isExport)
        ) {
          return res;
        }
        return {
          data: res,
          success: true,
        };
      }),
    );
  }
}
