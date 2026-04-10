import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoomCalendarQueryDto {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;
}

export class UpdateCalendarItemDto {
  @ApiProperty({ example: '2026-05-09' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 1100000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateCalendarDto {
  @ApiProperty({ type: [UpdateCalendarItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCalendarItemDto)
  updates: UpdateCalendarItemDto[];
}
