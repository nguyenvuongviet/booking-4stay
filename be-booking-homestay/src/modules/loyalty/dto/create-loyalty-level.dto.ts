import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLoyaltyLevelDto {
  @ApiProperty({ example: 'GOLD', description: 'Tên cấp độ' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 500,
    description: 'Điểm tối thiểu để đạt cấp độ này',
  })
  @IsInt()
  @Min(0)
  minPoints: number;

  @ApiProperty({
    example: 'Khách hàng VIP',
    description: 'Mô tả cấp độ',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
