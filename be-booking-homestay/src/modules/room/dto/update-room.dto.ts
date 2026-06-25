import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateRoomDto } from './create-room.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional({
    example: 'AVAILABLE',
    description: 'Trạng thái phòng',
  })
  @IsOptional()
  @IsEnum(['AVAILABLE', 'BOOKED', 'MAINTENANCE'])
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';
}
