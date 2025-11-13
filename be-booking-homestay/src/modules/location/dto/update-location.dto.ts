import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'Tên mới' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Mã mới' })
  @IsOptional()
  @IsString()
  code?: string;
}
