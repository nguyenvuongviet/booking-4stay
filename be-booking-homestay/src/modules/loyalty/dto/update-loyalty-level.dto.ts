import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateLoyaltyLevelDto {
  @ApiPropertyOptional({ example: 'PLATINUM' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim().toUpperCase())
  name?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @ApiPropertyOptional({ example: 'Mô tả mới' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
