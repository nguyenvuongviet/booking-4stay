import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateUserLoyaltyDto {
  @ApiPropertyOptional({
    example: 2,
    description: 'ID của cấp độ Loyalty (levelId)',
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @Min(1)
  levelId?: number;

  @ApiPropertyOptional({ example: 2500, description: 'Số điểm của user' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Tổng số lượt booking của user',
  })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @Min(0)
  totalBookings?: number;

  @ApiPropertyOptional({ example: 25, description: 'Tổng số đêm lưu trú' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsInt()
  @Min(0)
  totalNights?: number;
}
