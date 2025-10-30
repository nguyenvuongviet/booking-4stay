import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class RoomAvailabilityDto {
  @ApiProperty({ example: '2025-12-10' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2025-12-12' })
  @IsDateString()
  checkOut: string;
}
