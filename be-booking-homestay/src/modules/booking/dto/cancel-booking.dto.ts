import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Change of plan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;
}
