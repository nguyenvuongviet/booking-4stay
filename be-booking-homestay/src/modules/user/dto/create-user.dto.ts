import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Role } from './enum.dto';

export class CreateUserDto {
  @ApiProperty({
    example: 'nguyenvana123@gmail.com',
    description: 'Email của bạn',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  email: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu của bạn' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Mật khẩu phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (@, $, !, %, *, ?, &)',
    },
  )
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn', description: 'Họ của bạn' })
  @IsString({ message: 'Họ phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ không được để trống' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'An', description: 'Tên của bạn' })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  lastName: string;

  @ApiProperty({ example: '0123456789', description: 'Số điện thoại của bạn' })
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0[0-9]{8,10}$/, {
    message:
      'Số điện thoại không hợp lệ (Ví dụ: 0912345678, gồm 9-11 chữ số bắt đầu bằng 0)',
  })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  phoneNumber: string;

  @ApiProperty({ example: 'Việt Nam', description: 'Quốc gia của bạn' })
  @IsString({ message: 'Quốc gia phải là chuỗi' })
  @IsNotEmpty({ message: 'Quốc gia không được để trống' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
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
}
