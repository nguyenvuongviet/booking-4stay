import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { VerifyOtpDto } from '../otp/dto/verifyOtp.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtpDto);
  }

  @Public()
  @Post('activate-account')
  async activateAccount(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.activateAccount(verifyOtpDto);
  }

  @Public()
  @Post('login')
  async login(@Body() loginAuthDto: LoginDto) {
    console.log({ loginAuthDto });

    return await this.authService.login(loginAuthDto);
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
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return await this.authService.refreshToken(refreshTokenDto);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }


  @Public()
@Post('google-login')
async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
  return await this.authService.googleLogin(googleLoginDto.token);
}
}
