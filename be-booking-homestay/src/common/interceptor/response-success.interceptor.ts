import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PORT } from '../constant/app.constant';

@Injectable()
export class ResponseSuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const statusCode = res.statusCode;
    const baseUrl = `http://localhost:${PORT}/api-docs`;
    const methodName = context.getHandler().name;
    const controllerName = context.getClass().name;
    const tag = controllerName.replace('Controller', '');
    const docUrl = `${baseUrl}/#/${tag}/${controllerName}_${methodName}`;
    return next.handle().pipe(
      map((data) => {
        return {
          status: 'Success',
          code: statusCode,
          data,
          doc: docUrl,
        };
      }),
    );
  }
}
