import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class OtpService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createOtp(
    email: string,
    userId: number,
    type: 'REGISTER' | 'FORGOT_PASSWORD',
  ) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prismaService.otp_codes.deleteMany({
      where: { email },
    });

    await this.prismaService.otp_codes.create({
      data: { userId, email, otp, expiresAt },
    });

    await this.mailService.sendOtpMail(email, otp, type);

    console.log(`OTP cho ${email}: ${otp}`);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    const otpRecord = await this.prismaService.otp_codes.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord)
      throw new BadRequestException('OTP không hợp lệ hoặc hết hạn!');

    await this.prismaService.otp_codes.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return {
      success: true,
      message: 'OTP hợp lệ!',
    };
  }
}
