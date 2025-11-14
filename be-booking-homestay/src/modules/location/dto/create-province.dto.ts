import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Express } from 'express';

export class CreateProvinceDto {
  @ApiProperty({ example: 1, description: 'ID của quốc gia' })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 'Hà Nội', description: 'Tên tỉnh/thành phố' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return trimmed;
  })
  name: string;

  @ApiPropertyOptional({ example: 'HN', description: 'Mã tỉnh (tùy chọn)' })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.trim().toUpperCase();
  })
  code?: string;
}
