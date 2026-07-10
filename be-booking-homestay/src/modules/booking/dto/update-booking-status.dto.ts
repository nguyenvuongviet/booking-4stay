import { ApiProperty } from '@nestjs/swagger';
import { bookings_status } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: bookings_status,
    example: 'CHECKED_IN',
    description:
      'Trạng thái mới của booking (chỉ cho phép CHECKED_IN hoặc CHECKED_OUT)',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(bookings_status, { message: 'Trạng thái không hợp lệ' })
  status: bookings_status;

  @ApiProperty({
    example: 'Khách trả phòng muộn 3 tiếng, phụ thu 150k tiền mặt',
    description:
      'Ghi chú lý do thay đổi trạng thái (ví dụ: lý do check-out muộn, hỏng đồ...)',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  reason?: string;

  @ApiProperty({
    example: 150000,
    description: 'Số tiền phụ thu phát sinh (nếu có)',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Số tiền phụ thu phải là số nguyên' })
  @Min(0, { message: 'Số tiền phụ thu không được âm' })
  surcharge?: number;
}
