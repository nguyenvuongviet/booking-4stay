import { ApiPropertyOptional } from '@nestjs/swagger';
import { promotions_type } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class PromotionQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: 'DALAT' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: promotions_type })
  @IsOptional()
  @IsEnum(promotions_type)
  promotionType?: promotions_type;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  status?: string; // 'active' | 'expired' | 'all'
}
