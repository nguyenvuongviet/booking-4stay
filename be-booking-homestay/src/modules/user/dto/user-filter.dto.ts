import { ApiPropertyOptional } from '@nestjs/swagger';
import { loyalty_program_level } from '@prisma/client';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
  HOST = 'HOST',
}

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
    enum: loyalty_program_level,
    description: 'Cấp độ loyalty',
  })
  @IsOptional()
  @IsEnum(loyalty_program_level, {
    message: 'loyaltyLevel must be BRONZE, SILVER, GOLD, or PLATINUM',
  })
  loyaltyLevel?: loyalty_program_level;
}
