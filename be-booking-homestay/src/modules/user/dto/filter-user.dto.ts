import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { LoyaltyLevel, Role } from './enum.dto';

export class UserFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: Role,
    description: 'Tên vai trò người dùng',
  })
  @IsOptional()
  @IsEnum(Role, {
    message: 'roleName must be ADMIN, USER, or HOST',
  })
  roleName?: Role;

  @ApiPropertyOptional({
    enum: LoyaltyLevel,
    description: 'Cấp độ loyalty',
  })
  @IsOptional()
  @IsEnum(LoyaltyLevel, {
    message: 'loyaltyLevel must be BRONZE, SILVER, GOLD, or PLATINUM',
  })
  loyaltyLevel?: LoyaltyLevel;
}
