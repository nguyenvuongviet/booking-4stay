import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenModule } from '../token/token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [TokenModule, OtpModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}
