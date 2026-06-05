import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdatePromotionDto {
  @ApiPropertyOptional({ example: 'Giảm 20% Đà Lạt' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: promotions_type })
  @IsOptional()
  @IsEnum(promotions_type)
  promotionType?: promotions_type;

  @ApiPropertyOptional({ enum: discount_type })
  @IsOptional()
  @IsEnum(discount_type)
  discountType?: discount_type;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ example: 200000 })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @Min(0)
  maxDiscount?: number | null;

  @ApiPropertyOptional({ example: 500000 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minOrderValue?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  provinceId?: number | null;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  targetLevelId?: number | null;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perUserLimit?: number;

  @ApiPropertyOptional({ example: '2026-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: [1, 2] })
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  blogPostIds?: number[];
}
