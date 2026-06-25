import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @ApiPropertyOptional({ description: 'ID của user nếu đã đăng nhập' })
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: 'Họ và tên người gửi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @ApiProperty({ description: 'Email liên hệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ description: 'Nội dung tin nhắn' })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString()
  @MaxLength(1000)
  message!: string;
}
