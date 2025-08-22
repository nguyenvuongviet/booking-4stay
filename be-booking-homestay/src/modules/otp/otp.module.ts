import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OtpService, MailService, PrismaService],
  exports: [OtpService],
})
export class OtpModule {}
