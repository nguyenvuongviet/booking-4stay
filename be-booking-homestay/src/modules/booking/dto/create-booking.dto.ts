import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { bookings_paymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID của phòng cần đặt' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({
    example: '2025-12-10',
    description: 'Ngày nhận phòng (YYYY-MM-DD)',
  })
  @IsDateString()
  checkIn: string;

  @ApiProperty({
    example: '2025-12-12',
    description: 'Ngày trả phòng (YYYY-MM-DD)',
  })
  @IsDateString()
  checkOut: string;

  @ApiPropertyOptional({ example: 2, description: 'Số lượng người lớn' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number = 1;

  @ApiPropertyOptional({ example: 1, description: 'Số lượng trẻ em' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên người đặt phòng' })
  @IsString()
  @IsNotEmpty()
  guestFullName: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Email của người đặt phòng',
  })
  @IsEmail()
  guestEmail: string;

  @ApiProperty({
    example: '+84901234567',
    description: 'Số điện thoại người đặt phòng',
  })
  @IsPhoneNumber('VN')
  guestPhoneNumber: string;

  @ApiPropertyOptional({
    example: 'Yêu cầu thêm gối và check-in sớm',
    description: 'Ghi chú đặc biệt (nếu có)',
  })
  @IsOptional()
  @IsString()
  specialRequest?: string;

  @ApiPropertyOptional({
    example: 'CASH',
    description: 'Phương thức thanh toán',
  })
  @IsOptional()
  @IsEnum(bookings_paymentMethod)
  paymentMethod: bookings_paymentMethod;
}
