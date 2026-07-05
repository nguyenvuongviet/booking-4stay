import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class RoomFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Số người lớn' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ description: 'Số trẻ em' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ description: 'Điểm đánh giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Ngày check-in (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiPropertyOptional({
    description: 'Ngày check-out (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => !!o.checkIn)
  checkOut?: string;

  @ApiPropertyOptional({ description: 'ID tỉnh thành' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceId?: number;

  @ApiPropertyOptional({
    example: 'price',
    description: 'sortBy: price|rating|createdAt|id',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'price' | 'rating' | 'createdAt' | 'id';

  @ApiPropertyOptional({ example: 'asc', description: 'sortOrder: asc|desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
