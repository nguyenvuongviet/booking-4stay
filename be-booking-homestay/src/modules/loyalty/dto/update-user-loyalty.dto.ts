import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserLoyaltyDto {
  @ApiPropertyOptional({ example: 'GOLD', description: 'Tên cấp độ' })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({ example: 2500, description: 'Số điểm mới' })
  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: 10, description: 'Tổng số booking' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBookings?: number;

  @ApiPropertyOptional({ example: 25, description: 'Tổng số đêm lưu trú' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalNights?: number;
}
