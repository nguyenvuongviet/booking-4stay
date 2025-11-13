import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Express } from 'express';

export class CreateProvinceDto {
  @ApiProperty({ example: 1, description: 'ID của quốc gia' })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 'Hà Nội', description: 'Tên tỉnh/thành phố' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'HN', description: 'Mã tỉnh (tùy chọn)' })
  @IsString()
  @IsOptional()
  code?: string;
}
