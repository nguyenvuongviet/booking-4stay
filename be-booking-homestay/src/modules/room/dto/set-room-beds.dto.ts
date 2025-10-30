import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum BedType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  QUEEN = 'QUEEN',
  KING = 'KING',
  SOFA_BED = 'SOFA_BED',
  BUNK_BED = 'BUNK_BED',
}

export class BedItemDto {
  @ApiProperty({ enum: BedType, example: 'QUEEN' })
  @IsEnum(BedType)
  type: BedType;

  @ApiProperty({ example: 2, description: 'Số lượng giường của loại này' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class SetRoomBedsDto {
  @ApiProperty({
    type: [BedItemDto],
    example: [
      { type: 'QUEEN', quantity: 1 },
      { type: 'SOFA_BED', quantity: 1 },
    ],
    description: 'Danh sách giường muốn gán cho phòng (thay toàn bộ)',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BedItemDto)
  beds: BedItemDto[];
}
