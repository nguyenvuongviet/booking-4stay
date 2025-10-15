import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
  IsInt,
  Max,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class RoomFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 100000, description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @ApiPropertyOptional({ example: 10000000, description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @ApiPropertyOptional({ example: 1, description: 'Số người' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ example: 1, description: 'Số trẻ em' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ example: 4.5, description: 'Đánh giá tốt' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  minRating?: number;
}
