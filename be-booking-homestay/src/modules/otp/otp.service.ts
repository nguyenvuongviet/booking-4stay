import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { VerifyOtpDto } from './dto/verifyOtp.dto';

@Injectable()
export class OtpService {
  private readonly OTP_LENGTH = 6;
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 phút

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(
      10 ** (this.OTP_LENGTH - 1) +
        Math.random() * 9 * 10 ** (this.OTP_LENGTH - 1),
    ).toString();
  }

  async createOtp(
    email: string,
    userId: number,
    type: 'REGISTER' | 'FORGOT_PASSWORD',
  ): Promise<void> {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MS);

    try {
      await this.prismaService.$transaction([
        this.prismaService.otp_codes.deleteMany({ where: { email } }),
        this.prismaService.otp_codes.create({
          data: { userId, email, otp, expiresAt },
        }),
      ]);

      // this.mailService
      //   .sendOtpMail(email, otp, type)
      //   .catch((error) =>
      //     console.log(`Lỗi gửi email OTP cho ${email}: ${error.message}`),
      //   );

      console.log(`OTP cho ${email}: ${otp}`);
    } catch (error) {
      console.log(`Lỗi tạo OTP cho ${email}: ${error.message}`);
      throw new BadRequestException('Không thể tạo OTP. Vui lòng thử lại.');
    }
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ success: boolean; message: string }> {
    const { email, otp } = verifyOtpDto;

    try {
      const otpRecord = await this.prismaService.otp_codes.findFirst({
        where: {
          email,
          otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!otpRecord) {
        throw new BadRequestException('OTP không hợp lệ hoặc hết hạn!');
      }

      await this.prismaService.otp_codes.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });

      return { success: true, message: 'OTP hợp lệ!' };
    } catch (error) {
      console.log(`Lỗi xác thực OTP cho ${email}: ${error.message}`);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Lỗi khi xác thực OTP. Vui lòng thử lại.');
    }
  }
}
