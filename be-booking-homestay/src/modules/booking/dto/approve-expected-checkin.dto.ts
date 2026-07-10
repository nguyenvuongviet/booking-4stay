import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveExpectedCheckInDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: ['APPROVED', 'REJECTED'],
    description: 'Trạng thái phê duyệt (APPROVED hoặc REJECTED)',
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(['APPROVED', 'REJECTED'], {
    message: 'Trạng thái phê duyệt không hợp lệ',
  })
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({
    example: 'Chấp nhận giờ nhận phòng dự kiến.',
    description: 'Lời nhắn hoặc lý do từ Admin gửi đến khách hàng',
  })
  @IsOptional()
  @IsString({ message: 'Lời nhắn phải là chuỗi ký tự' })
  adminNote?: string;
}
