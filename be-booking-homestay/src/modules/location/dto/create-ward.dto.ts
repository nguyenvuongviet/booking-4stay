import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWardDto {
  @ApiProperty({ example: 1, description: 'ID của quận/huyện' })
  @IsNumber()
  districtId: number;

  @ApiProperty({ example: 'Phường Phúc Xá', description: 'Tên phường/xã' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'PX',
    description: 'Mã phường/xã (tùy chọn)',
  })
  @IsString()
  @IsOptional()
  code?: string;
}
