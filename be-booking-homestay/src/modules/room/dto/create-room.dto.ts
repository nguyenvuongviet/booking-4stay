import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'Phòng Deluxe view biển' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  name: string;

  @ApiPropertyOptional({ example: 'Phòng rộng rãi, có ban công view biển' })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  description?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  adultCapacity: number;

  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  childCapacity?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  provinceId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  districtId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  wardId?: number;

  @ApiPropertyOptional({ example: '47/57 Nguyễn Thái Bình' })
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  street: string;
}
