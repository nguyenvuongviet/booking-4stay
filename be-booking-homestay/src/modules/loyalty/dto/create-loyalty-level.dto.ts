import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateLoyaltyLevelDto {
  @ApiProperty({ example: 'GOLD', description: 'Tên cấp độ' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim().toUpperCase())
  name: string;

  @ApiProperty({ example: 500, description: 'Điểm tối thiểu' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPoints: number;

  @ApiProperty({ example: 10, description: 'Phần trăm giảm giá (0-100)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({ example: 500000, description: 'Số tiền giảm tối đa' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscountAmount: number;

  @ApiProperty({
    example: 'Khách hàng VIP',
    description: 'Mô tả cấp độ',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description?: string;
}
