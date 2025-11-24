import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWardDto {
  @ApiProperty({ example: 1, description: 'ID của quận/huyện' })
  @IsNumber()
  districtId: number;

  @ApiProperty({ example: 'Phường Phúc Xá', description: 'Tên phường/xã' })
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
    example: 'PX',
    description: 'Mã phường/xã (tùy chọn)',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    return value?.trim().toUpperCase();
  })
  code?: string;
}
