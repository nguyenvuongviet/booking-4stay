import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty({ example: 1, description: 'ID của tỉnh/thành phố' })
  @IsNumber()
  provinceId: number;

  @ApiProperty({ example: 'Quận Hoàn Kiếm', description: 'Tên quận/huyện' })
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

  @ApiPropertyOptional({
    example: 'HK',
    description: 'Mã quận/huyện (tùy chọn)',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.trim().toUpperCase();
  })
  code?: string;
}
