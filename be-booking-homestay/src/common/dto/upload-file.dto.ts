import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File upload' })
  file: any;
}

export class UploadRoomImagesDto {
  @ApiProperty({
    description: 'Danh sách file ảnh cần upload dạng array (định dạng ảnh jpg|jpeg|png)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  files: any[];

  @ApiProperty({
    description: 'Metadata từng ảnh (isMain, ...), dạng JSON string',
    required: false,
    example: JSON.stringify([{ isMain: true }, { isMain: false }]),
  })
  images?: string;
}
