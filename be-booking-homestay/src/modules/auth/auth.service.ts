import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { VerifyOtpDto } from '../otp/dto/verifyOtp.dto';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from 'src/common/constant/app.constant';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, phoneNumber, fullName } = registerDto;

    const userExist = await this.prismaService.users.findUnique({
      where: { email },
    });

    if (userExist) {
      if (userExist.isVerified) {
        throw new BadRequestException('Tài khoản đã tồn tại!');
      } else {
        await this.prismaService.otp_codes.deleteMany({
          where: { userId: userExist.id },
        });
        await this.prismaService.users.delete({ where: { id: userExist.id } });
      }
    }

    const salt = await bcrypt.genSalt(10); // tạo ra một chuỗi ngẫu nhiên để làm tăng phức tạp mã hoá ()
    console.log({ salt });
    const hashPassword = await bcrypt.hash(password, salt);

    const defaultRole = await this.prismaService.roles.findUnique({
      where: { name: 'USER' },
    });

    if (!defaultRole) throw new Error('Vai trò mặc định không tìm thấy');

    const userNew = await this.prismaService.users.create({
      data: {
        email,
        password: hashPassword,
        phoneNumber: phoneNumber,
        fullName: fullName,
        roleId: defaultRole.id,
        isActive: false,
        isVerified: false,
      },
    });

    console.log({ userNew });
    const { password: _, ...user } = userNew;

    await this.otpService.createOtp(email, userNew.id, 'REGISTER');

    return {
      message: 'Đăng ký tài khoản thành công, vui lòng kích hoạt tài khoản!',
      user,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    return await this.otpService.verifyOtp(verifyOtpDto);
  }

  async activateAccount(verifyOtpDto: VerifyOtpDto) {
    const { email } = verifyOtpDto;

    const verify = this.verifyOtp(verifyOtpDto);

    if (!verify)
      throw new BadRequestException('OTP không hợp lệ hoặc hết hạn!');

    const userExist = await this.prismaService.users.findUnique({
      where: { email },
    });
    if (!userExist || userExist.isDeleted) {
      throw new BadRequestException('Tài khoản không tìm thấy!');
    }

    await this.prismaService.$transaction([
      this.prismaService.users.update({
        where: { email },
        data: {
          isActive: true,
          isVerified: true,
          updatedAt: new Date(),
        },
      }),
      this.prismaService.loyalty_program.create({
        data: {
          userId: userExist.id,
          totalBookings: 0,
          totalNights: 0,
          points: 0,
          level: 'BRONZE',
        },
      }),
    ]);

    return { message: 'Tài khoản của bạn đã kích hoạt!' };
  }

  async login(loginAuthDto: LoginDto) {
    const { email, password } = loginAuthDto;

    const userExist = await this.prismaService.users.findUnique({
      where: {
        email: email,
      },
    });

    if (!userExist || !userExist.isActive)
      throw new BadRequestException(
        `Tài khoản chưa tồn tại, vui lòng đăng ký tài khoản!`,
      );
    if (!userExist?.password)
      throw new BadRequestException(`Mật khẩu không hợp lệ!`);

    const isPassword = bcrypt.compareSync(password, userExist.password);

    if (!isPassword)
      throw new BadRequestException('Email hoặc mật khẩu không chính xác.');

    const tokens = this.tokenService.createTokens(userExist.id);
    return tokens;
  }

  async getUserInfo(user: any) {
    const { password, ...userInfo } = user;
    return userInfo;
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { accessToken, refreshToken } = refreshTokenDto;
    if (!accessToken) throw new UnauthorizedException(`Không có accessToken`);
    if (!refreshToken) throw new UnauthorizedException(`Không có refreshToken`);

    const decodeRefreshToken = jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET as string,
    ) as { userId: number };
    const decodeAccessToken = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET as string,
      {
        ignoreExpiration: true,
      },
    ) as { userId: number };

    if (decodeRefreshToken.userId !== decodeAccessToken.userId)
      throw new UnauthorizedException(`Token không hợp lệ`);

    const tokens = this.tokenService.createTokens(decodeRefreshToken.userId);

    return tokens;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const userExist = await this.prismaService.users.findUnique({
      where: { email },
    });

    if (!userExist) throw new BadRequestException('Tài khoản không tìm thấy!');

    await this.otpService.createOtp(
      userExist.email,
      userExist.id,
      'FORGOT_PASSWORD',
    );

    return { message: 'OTP đặt lại mật khẩu đã được gửi đến email của bạn.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, newPassword } = resetPasswordDto;

    const userExist = await this.prismaService.users.findUnique({
      where: { email },
    });

    if (!userExist) throw new BadRequestException('Tài khoản không tìm thấy!');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await this.prismaService.users.update({
      where: { email },
      data: {
        password: hashPassword,
      },
    });

    return { message: 'Đặt lại mật khẩu thành công!' };
  }

  async googleLogin(loginAuthDto: LoginDto) {
    return 'google login';
  }
}
