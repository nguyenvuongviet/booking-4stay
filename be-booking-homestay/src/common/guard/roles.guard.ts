import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; 
    }

    const { user } = context.switchToHttp().getRequest();

    // console.log({ user });

    if (!user) {
      throw new ForbiddenException('Bạn chưa đăng nhập!');
    }

    if (!requiredRoles.includes(user.roles?.name)) {
      throw new ForbiddenException('Bạn không có quyền truy cập!');
    }

    return true;
  }
}
