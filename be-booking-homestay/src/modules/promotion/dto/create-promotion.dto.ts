import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { discount_type, promotions_type } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreatePromotionDto {
  @ApiProperty({ example: 'DALAT15', description: 'Mã giảm giá (unique)' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  code: string;

  @ApiProperty({ example: 'Giảm 15% Đà Lạt', description: 'Tên chương trình' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: promotions_type, default: 'SEASONAL' })
  @IsOptional()
  @IsEnum(promotions_type)
  promotionType?: promotions_type;

  @ApiProperty({ enum: discount_type })
  @IsEnum(discount_type)
  discountType: discount_type;

  @ApiProperty({ example: 15, description: 'Giá trị giảm (% hoặc VNĐ)' })
  @Type(() => Number)
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    example: 150000,
    description: 'Mức giảm tối đa (cho PERCENTAGE)',
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @Min(0)
  maxDiscount?: number | null;

  @ApiPropertyOptional({ example: 500000, description: 'Đơn hàng tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID tỉnh thành (null = toàn hệ thống)',
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  provinceId?: number | null;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID hạng thành viên áp dụng (null = tất cả)',
  })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  targetLevelId?: number | null;

  @ApiProperty({ example: 100, description: 'Tổng lượt sử dụng tối đa' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit: number;

  @ApiPropertyOptional({ example: 1, description: 'Số lần mỗi user được dùng' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00Z', description: 'Ngày bắt đầu' })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59Z',
    description: 'Ngày kết thúc',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    default: true,
    description: 'Public = dùng ngay, Private = phải lưu',
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'Danh sách blog post IDs gắn coupon',
  })
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  blogPostIds?: number[];
}
