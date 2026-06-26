import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ListBookingQuery extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'desc', description: 'asc | desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    example: 'CHECKED_OUT',
    description: 'Filter by status',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
