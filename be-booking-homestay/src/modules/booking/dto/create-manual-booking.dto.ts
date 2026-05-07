import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { bookings_paymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/**
 * DTO cho Admin tạo đơn đặt phòng thủ công (Manual Booking).
 * - Email không bắt buộc (khách offline có thể không cung cấp)
 * - Admin tự khai báo paidAmount và trạng thái
 * - Không yêu cầu policyUpdatedAt
 */
export class CreateManualBookingDto {
  @ApiProperty({ example: 1, description: 'ID của phòng cần đặt' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({
    example: '2026-05-10',
    description: 'Ngày nhận phòng (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'Ngày nhận phòng phải đúng định dạng ISO 8601 (YYYY-MM-DD)' },
  )
  checkIn: string;

  @ApiProperty({
    example: '2026-05-12',
    description: 'Ngày trả phòng (YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'Ngày trả phòng phải đúng định dạng ISO 8601 (YYYY-MM-DD)' },
  )
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

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Tên khách hàng (từ điện thoại, Zalo...)',
  })
  @IsString()
  @IsNotEmpty()
  guestFullName: string;

  @ApiPropertyOptional({
    example: 'khach@gmail.com',
    description: 'Email khách hàng (không bắt buộc cho khách offline)',
  })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại khách hàng',
  })
  @IsString()
  @IsNotEmpty()
  guestPhoneNumber: string;

  @ApiPropertyOptional({
    example: 'Yêu cầu check-in sớm',
    description: 'Ghi chú đặc biệt của khách',
  })
  @IsOptional()
  @IsString()
  specialRequest?: string;

  @ApiPropertyOptional({
    example: 'CASH',
    description: 'Phương thức thanh toán',
    enum: bookings_paymentMethod,
  })
  @IsOptional()
  @IsEnum(bookings_paymentMethod)
  paymentMethod?: bookings_paymentMethod = bookings_paymentMethod.CASH;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Số tiền khách đã cọc/thanh toán (Admin tự khai)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paidAmount?: number = 0;

  @ApiPropertyOptional({
    example: 'Khách gọi điện chốt lúc 10h sáng',
    description: 'Ghi chú nội bộ Admin',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Tạo tài khoản cho khách hàng (tích điểm Loyalty từ đơn đầu tiên). Nếu false hoặc không truyền -> gán WALK_IN_GUEST_ID.',
  })
  @IsOptional()
  @IsBoolean()
  createAccount?: boolean = false;
}
