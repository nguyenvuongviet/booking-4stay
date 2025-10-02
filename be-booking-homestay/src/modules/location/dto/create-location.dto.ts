import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {
  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ example: 'Ba Đình' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiPropertyOptional({ example: 'Phúc Xá' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ example: '12 Hoàng Hoa Thám' })
  @IsOptional()
  @IsString()
  street?: string;
}
