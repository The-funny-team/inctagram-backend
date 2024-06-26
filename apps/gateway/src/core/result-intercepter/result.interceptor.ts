import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
}

@Injectable()
export class ResultInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    console.log(context);
    return next.handle().pipe(
      map((result) => {
        if (!result.isSuccess) {
          throw result.err;
        }
        return result.value;

        // return {
        //   data,
        // };
      }),
    );
  }
}
