import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import chalk from 'chalk';
// import * as chalk from 'chalk';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const now = Date.now();

    const timestamp = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const methodColor = this.getMethodColor(method);
    const statusCode = res.statusCode;

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        const statusColor = this.getStatusColor(statusCode);

        console.log(
          `${chalk.gray(`[${timestamp}]`)} ` +
            `${methodColor(`${method.padEnd(6)}`)} ${chalk.white(url)} ` +
            `${statusColor(`${statusCode}`)} ${chalk.yellow(`${responseTime}ms`)}`,
        );
      }),
    );
  }

  private getMethodColor(method: string): (text: string) => string {
    switch (method.toUpperCase()) {
      case 'GET':
        return chalk.green;
      case 'POST':
        return chalk.blue;
      case 'PUT':
        return chalk.yellow;
      case 'PATCH':
        return chalk.magenta;
      case 'DELETE':
        return chalk.red;
      default:
        return chalk.white;
    }
  }

  private getStatusColor(statusCode: number): (text: string) => string {
    if (statusCode >= 200 && statusCode < 300) return chalk.green;
    if (statusCode >= 300 && statusCode < 400) return chalk.cyan;
    if (statusCode >= 400 && statusCode < 500) return chalk.red;
    if (statusCode >= 500) return chalk.red.bold;
    return chalk.white;
  }
}
