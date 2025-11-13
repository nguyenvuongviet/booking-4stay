import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDistrictDto {
  @ApiProperty({ example: 1, description: 'ID của tỉnh/thành phố' })
  @IsNumber()
  provinceId: number;

  @ApiProperty({ example: 'Quận Hoàn Kiếm', description: 'Tên quận/huyện' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'HK',
    description: 'Mã quận/huyện (tùy chọn)',
  })
  @IsString()
  @IsOptional()
  code?: string;
}
