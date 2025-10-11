import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from 'src/common/constant/app.constant';
import { Validator } from 'src/common/validation';
import { getLoyaltyLevel } from 'src/helpers/loyalty.helper';
import { sanitizeUserData } from 'src/helpers/user.helper';
import { VerifyOtpDto } from '../otp/dto/verifyOtp.dto';
import { OtpService } from '../otp/otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; user: any }> {
    const { email, password, phoneNumber, firstName, lastName } = registerDto;

    if (Validator.isValidEmail(email) === false) {
      throw new BadRequestException('Email không hợp lệ!');
    }

    try {
      const [userExist, defaultRole, salt] = await Promise.all([
        this.prismaService.users.findUnique({ where: { email } }),
        this.prismaService.roles.findUnique({ where: { name: 'USER' } }),
        bcrypt.genSalt(10),
      ]);

      const hashPassword = await bcrypt.hash(password, salt);
      console.log({ salt });

      if (!defaultRole) {
        throw new BadRequestException('Vai trò mặc định không tìm thấy');
      }

      if (userExist && !userExist.isVerified) {
        await this.prismaService.$transaction([
          this.prismaService.otp_codes.deleteMany({
            where: { userId: userExist.id },
          }),
          this.prismaService.users.delete({ where: { id: userExist.id } }),
        ]);
      } else if (userExist) {
        throw new BadRequestException('Tài khoản đã tồn tại!');
      }

      const userNew = await this.prismaService.users.create({
        data: {
          email,
          password: hashPassword,
          phoneNumber,
          firstName,
          lastName,
          isActive: false,
          isVerified: false,
          user_roles: {
            create: { roleId: defaultRole.id },
          },
        },
        include: {
          user_roles: { include: { roles: { select: { name: true } } } },
        },
      });

      console.log({ userNew });

      this.otpService
        .createOtp(email, userNew.id, 'REGISTER')
        .catch((error) => {
          console.log(`Lỗi tạo OTP cho ${email}: ${error.message}`);
        });

      return {
        message: 'Đăng ký tài khoản thành công, vui lòng kích hoạt tài khoản!',
        user: sanitizeUserData(userNew),
      };
    } catch (error) {
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Lỗi khi đăng ký. Vui lòng thử lại.');
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.otpService.verifyOtp(verifyOtpDto);
    } catch (error) {
      console.log(
        `Lỗi xác thực OTP cho ${verifyOtpDto.email}: ${error.message}`,
      );
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('OTP không hợp lệ hoặc hết hạn!');
    }
  }

  async activateAccount(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ message: string }> {
    const { email } = verifyOtpDto;

    if (Validator.isValidEmail(email) === false) {
      throw new BadRequestException('Email không hợp lệ!');
    }

    try {
      const [verifyResult, userExist, bronzeLevel] = await Promise.all([
        this.verifyOtp(verifyOtpDto),
        this.prismaService.users.findUnique({ where: { email } }),
        getLoyaltyLevel(this.prismaService, 'BRONZE'),
      ]);

      if (!verifyResult.success) {
        throw new BadRequestException('OTP không hợp lệ hoặc hết hạn!');
      }
      if (!userExist || userExist.isDeleted) {
        throw new BadRequestException('Tài khoản không tìm thấy!');
      }
      if (!bronzeLevel) {
        throw new BadRequestException('Không tìm thấy level BRONZE');
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
            levelId: bronzeLevel.id,
          },
        }),
      ]);

      return { message: 'Tài khoản của bạn đã kích hoạt!' };
    } catch (error) {
      console.log(`Lỗi khi kích hoạt tài khoản cho ${email}: ${error.message}`);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(
            'Lỗi khi kích hoạt tài khoản. Vui lòng thử lại.',
          );
    }
  }

  async login(loginAuthDto: LoginDto): Promise<any> {
    const { email, password } = loginAuthDto;

    if (Validator.isValidEmail(email) === false) {
      throw new BadRequestException('Email không hợp lệ!');
    }

    try {
      const userExist = await this.prismaService.users.findUnique({
        where: { email },
        include: {
          user_roles: { include: { roles: true } },
          loyalty_program: { include: { loyalty_levels: true } },
        },
      });

      if (!userExist || !userExist.isActive)
        throw new BadRequestException(
          'Tài khoản chưa tồn tại hoặc chưa kích hoạt!',
        );
      if (!userExist.password)
        throw new BadRequestException('Mật khẩu không hợp lệ!');

      const isPassword = await bcrypt.compare(password, userExist.password);
      if (!isPassword)
        throw new BadRequestException('Email hoặc mật khẩu không chính xác.');

      const tokens = this.tokenService.createTokens(userExist.id);
      return { ...tokens, user: sanitizeUserData(userExist) };
    } catch (error) {
      console.log(`Lỗi khi đăng nhập cho ${email}: ${error.message}`);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Lỗi khi đăng nhập. Vui lòng thử lại.');
    }
  }

  async getUserInfo(user: any): Promise<any> {
    return sanitizeUserData(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { accessToken, refreshToken } = refreshTokenDto;
    if (!accessToken) throw new UnauthorizedException(`Không có accessToken`);
    if (!refreshToken) throw new UnauthorizedException(`Không có refreshToken`);

    try {
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

      if (decodeRefreshToken.userId !== decodeAccessToken.userId) {
        throw new UnauthorizedException('Token không hợp lệ');
      }
      const tokens = this.tokenService.createTokens(decodeRefreshToken.userId);

      return tokens;
    } catch (error) {
      console.log(`Lỗi khi làm mới token: ${error.message}`);
      throw error instanceof UnauthorizedException
        ? error
        : new UnauthorizedException('Lỗi khi làm mới token. Vui lòng thử lại.');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    if (Validator.isValidEmail(email) === false) {
      throw new BadRequestException('Email không hợp lệ!');
    }

    try {
      const userExist = await this.prismaService.users.findUnique({
        where: { email },
      });

      if (!userExist) {
        throw new BadRequestException('Tài khoản không tìm thấy!');
      }

      this.otpService
        .createOtp(userExist.email, userExist.id, 'FORGOT_PASSWORD')
        .catch((error) =>
          console.log(`Lỗi tạo OTP cho ${email}: ${error.message}`),
        );

      return { message: 'OTP đặt lại mật khẩu đã được gửi đến email của bạn.' };
    } catch (error) {
      console.log(`Lỗi khi xử lý yêu cầu quên mật khẩu: ${error.message}`);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException('Lỗi khi xử lý yêu cầu. Vui lòng thử lại.');
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;
    if (Validator.isValidEmail(email) === false) {
      throw new BadRequestException('Email không hợp lệ!');
    }

    try {
      const [userExist, salt] = await Promise.all([
        this.prismaService.users.findUnique({ where: { email } }),
        bcrypt.genSalt(10),
      ]);

      const hashPassword = await bcrypt.hash(newPassword, salt);
      if (!userExist) {
        throw new BadRequestException('Tài khoản không tìm thấy!');
      }

      await this.prismaService.users.update({
        where: { email },
        data: { password: hashPassword },
      });

      return { message: 'Đặt lại mật khẩu thành công!' };
    } catch (error) {
      console.log(`Lỗi khi đặt lại mật khẩu cho ${email}: ${error.message}`);
      throw error instanceof BadRequestException
        ? error
        : new BadRequestException(
            'Lỗi khi đặt lại mật khẩu. Vui lòng thử lại.',
          );
    }
  }

  async googleLogin(loginAuthDto: LoginDto) {
    return 'google login';
  }
}
