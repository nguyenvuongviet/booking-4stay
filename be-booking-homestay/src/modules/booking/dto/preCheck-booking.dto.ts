import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsDateString, Min } from 'class-validator';

export class PreCheckDto {
  @ApiProperty({ example: 1, description: 'ID của phòng cần kiểm tra giá' })
  @IsInt()
  @Min(1)
  roomId: number;

  @ApiProperty({
    example: '2026-03-25',
    description: 'Ngày nhận phòng (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @ApiProperty({
    example: '2026-03-27',
    description: 'Ngày trả phòng (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  checkOut: string;
}
