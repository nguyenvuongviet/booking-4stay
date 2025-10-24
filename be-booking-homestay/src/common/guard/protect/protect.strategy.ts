import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { sanitizeUserData } from 'src/helpers/user.helper';

@Injectable()
export class ProtectStrategy extends PassportStrategy(Strategy, `protect`) {
  constructor(private readonly prismaService: PrismaService) {
    const secretOrKey = ACCESS_TOKEN_SECRET;
    if (!secretOrKey) {
      throw new Error('ACCESS_TOKEN_SECRET is missing');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey,
    });
  }

  async validate(decode: any) {
    // console.log(`ProtectStrategy :: validate`);

    const user = await this.prismaService.users.findUnique({
      where: {
        id: decode.userId,
      },
      include: {
        user_roles: { include: { roles: { select: { name: true } } } },
        loyalty_program: {
          include: { levels: { select: { name: true } } },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(`User not found`);
    }

    return user;
  }
}
