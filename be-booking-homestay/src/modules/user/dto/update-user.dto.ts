import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { users_gender } from '@prisma/client';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password', 'roleName'] as const),
) {
  @ApiPropertyOptional({ example: '2000-01-01', description: 'Ngày sinh' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: users_gender, description: 'Giới tính' })
  @IsOptional()
  @IsEnum(users_gender)
  gender?: users_gender;
}
