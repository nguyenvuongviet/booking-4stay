import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { VerifyOtpDto } from '../otp/dto/verifyOtp.dto';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('activate-account')
  async activateAccount(@Body() dto: VerifyOtpDto) {
    return await this.authService.activateAccount(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    console.log({ dto });

    return await this.authService.login(dto);
  }

  @Get('get-info')
  @ApiBearerAuth('AccessToken')
  async getUserInfo(
    @Req()
    req: any,
  ) {
    return await this.authService.getUserInfo(req.user);
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return await this.authService.refreshToken(dto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Public()
  @Post('google-login')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return await this.authService.googleLogin(dto);
  }
}
