import { Injectable } from '@nestjs/common';
import cloudinary from 'src/config/cloudinary.config';

@Injectable()
export class CloudinaryService {
  async uploadImage(buffer: Buffer, folder = 'default') {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: `4stay/${folder}`, resource_type: 'image' },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        )
        .end(buffer);
    });
  }

  async deleteImage(publicId: string) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}
