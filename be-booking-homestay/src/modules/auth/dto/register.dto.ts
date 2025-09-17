import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Nguyễn Văn', description: 'Họ của bạn' })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  firstName: string;

  @ApiProperty({ example: 'An', description: 'Tên của bạn' })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  lastName: string;

  @ApiProperty({
    example: 'nguyenvana123@gmail.com',
    description: 'Email của bạn',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu của bạn' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại của bạn' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;
}
