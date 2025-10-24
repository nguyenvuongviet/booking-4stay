import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';

export class ImageItemDto {
  @ApiProperty({
    example: true,
    required: false,
    description: 'Ảnh chính hay không',
  })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class DeleteRoomImagesDto {
  @ApiProperty({
    type: [Number],
    example: [12, 15, 18],
    description: 'Danh sách ID ảnh (trong bảng room_images) cần xoá',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  imageIds: number[];
}
