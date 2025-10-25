import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({ example: '2025-12-10' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2025-12-12' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number = 1;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number = 0;
}
