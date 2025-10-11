import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LoyaltyLevel, Role } from './enum.dto';

export class CreateUserDto {
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

  @ApiProperty({ example: 'Nguyễn Văn', description: 'Họ của bạn' })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  firstName: string;

  @ApiProperty({ example: 'An', description: 'Tên của bạn' })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  lastName: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại của bạn' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;

  @ApiProperty({ example: 'Việt Nam', description: 'Quốc gia của bạn' })
  @IsString({ message: 'Quốc gia phải là chuỗi' })
  @IsNotEmpty({ message: 'Quốc gia không được để trống' })
  country: string;

  @ApiPropertyOptional({
    enum: Role,
    description: 'Tên vai trò người dùng',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'roleName must be ADMIN, USER, or HOST',
  })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  roleName?: Role;

  @ApiProperty({
    enum: LoyaltyLevel,
    description: 'Mức độ khách hàng thân thiết',
    required: false,
  })
  @IsOptional()
  @IsEnum(LoyaltyLevel, {
    message: 'LoyaltyLevel must be BRONZE, SILVER, GOLD, or PLATINUM',
  })
  loyaltyLevel?: LoyaltyLevel;
}
