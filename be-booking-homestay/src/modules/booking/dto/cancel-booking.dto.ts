import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Change of plan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  reason?: string;
}
