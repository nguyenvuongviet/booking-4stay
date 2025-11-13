import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({ example: 'Việt Nam' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'VN', description: 'Mã quốc gia (2 ký tự)' })
  @IsString()
  @Length(2, 2)
  code: string;
}
