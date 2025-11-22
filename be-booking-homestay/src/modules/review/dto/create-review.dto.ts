import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsNumber,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  bookingId: number;

  @ApiProperty({ example: 4.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Phòng sạch, yên tĩnh, đáng tiền.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  comment?: string;
}
