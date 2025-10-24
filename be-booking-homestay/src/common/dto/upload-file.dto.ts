import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'File upload' })
  file: any;
}

export class UploadRoomImagesDto {
  @ApiProperty({
    type: [UploadFileDto],
    description: 'Danh sách file ảnh cần upload',
  })
  files: any[];

  @ApiProperty({
    type: 'string',
    required: false,
    example: JSON.stringify([{ isMain: true }, { isMain: false }]),
    description: 'Thông tin bổ sung cho từng ảnh (isMain, v.v.)',
  })
  images?: string;
}
