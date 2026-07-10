import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateBookingDto {
  @ApiProperty({
    example: '2025-12-01',
    description: 'Ngày nhận phòng mới',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiProperty({
    example: '2025-12-05',
    description: 'Ngày trả phòng mới',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiProperty({ example: 2, description: 'Số người lớn mới', required: false })
  @IsOptional()
  @IsInt({ message: 'Số người lớn phải là số nguyên' })
  @Min(1, { message: 'Phải có ít nhất 1 người lớn' })
  adults?: number;

  @ApiProperty({ example: 1, description: 'Số trẻ em mới', required: false })
  @IsOptional()
  @IsInt({ message: 'Số trẻ em phải là số nguyên' })
  @Min(0, { message: 'Số trẻ em không được âm' })
  children?: number;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ tên khách hàng',
    required: false,
  })
  @IsOptional()
  @IsString()
  guestFullName?: string;

  @ApiProperty({
    example: 'email@example.com',
    description: 'Email khách hàng',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  guestEmail?: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại khách hàng',
    required: false,
  })
  @IsOptional()
  @IsString()
  guestPhoneNumber?: string;

  @ApiProperty({
    example: 'Yêu cầu phòng tầng cao',
    description: 'Yêu cầu đặc biệt',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequest?: string;

  @ApiProperty({
    example: true,
    description:
      'Admin miễn phụ phí chênh lệch khi đổi sang ngày đắt hơn (chỉ Admin dùng)',
    required: false,
  })
  @IsOptional()
  waiveFee?: boolean;

  @ApiProperty({
    example: 'Vietcombank',
    description: 'Tên ngân hàng nhận hoàn tiền (khi tổng mới < đã trả)',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({
    example: '123456789',
    description: 'Số tài khoản nhận hoàn tiền',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @ApiProperty({
    example: 'NGUYEN VAN A',
    description: 'Chủ tài khoản nhận hoàn tiền',
    required: false,
  })
  @IsOptional()
  @IsString()
  bankAccountName?: string;

  @IsOptional()
  expectedCheckInReq?: boolean;

  @IsOptional()
  @IsString()
  expectedCheckInTime?: string;

  @IsOptional()
  @IsString()
  expectedCheckInReason?: string;
}
