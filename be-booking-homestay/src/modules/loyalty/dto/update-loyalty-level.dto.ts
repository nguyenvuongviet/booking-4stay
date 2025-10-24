import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, IsBoolean } from 'class-validator';

export class UpdateLoyaltyLevelDto {
  @ApiPropertyOptional({ example: 'PLATINUM', description: 'Tên cấp độ mới' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 1000, description: 'Điểm tối thiểu mới' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPoints?: number;

  @ApiPropertyOptional({ example: 'Khách hàng cao cấp', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
