import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

export class SetRoomAmenitiesDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 4, 7],
    description: 'Danh sách ID tiện nghi muốn gán cho phòng (thay toàn bộ)',
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  amenityIds: number[];
}
