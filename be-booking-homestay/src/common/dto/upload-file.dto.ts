import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File upload' })
  file: any;
}
