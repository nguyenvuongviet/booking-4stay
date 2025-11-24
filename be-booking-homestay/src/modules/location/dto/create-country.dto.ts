import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Việt Nam' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) => {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
    return trimmed;
  })
  name: string;

  @ApiProperty({ example: 'VN', description: 'Mã quốc gia (2 ký tự)' })
  @IsString()
  @Length(2, 2)
  @Transform(({ value }: TransformFnParams) => {
    return value?.trim().toUpperCase();
  })
  code: string;
}
