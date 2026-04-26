import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({ example: 'Change of plan' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }: TransformFnParams) => value?.trim())
  reason?: string;

  @ApiPropertyOptional({ example: 'Vietcombank' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'NGUYEN VAN A' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccountName?: string;
}
