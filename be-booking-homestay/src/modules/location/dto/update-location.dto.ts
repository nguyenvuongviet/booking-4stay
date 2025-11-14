import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'Tên mới' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return trimmed;
  })
  name?: string;

  @ApiPropertyOptional({ example: 'Mã mới' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => {
    return value?.trim().toUpperCase();
  })
  code?: string;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  countryId?: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  provinceId?: number;

  @ApiPropertyOptional({ example: '' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  districtId?: number;
}
