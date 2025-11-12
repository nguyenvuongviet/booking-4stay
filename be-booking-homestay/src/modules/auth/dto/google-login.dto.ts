import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Firebase ID token', example: 'eyJhbGciOi...' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
