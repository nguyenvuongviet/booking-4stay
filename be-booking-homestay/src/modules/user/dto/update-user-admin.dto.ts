import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { users_gender } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserAdminDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({ example: '2000-01-01', description: 'Ngày sinh' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: users_gender, description: 'Giới tính' })
  @IsOptional()
  @IsEnum(users_gender)
  gender?: users_gender;

  @ApiPropertyOptional({ example: true, description: 'Trạng thái kích hoạt' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
