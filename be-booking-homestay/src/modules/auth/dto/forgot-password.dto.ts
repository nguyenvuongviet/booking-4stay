import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
