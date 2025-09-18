import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';

export function uploadLocalConfig(
  subfolder: string,
  fieldName: string,
  maxSizeMB: number = 5,
) {
  const uploadDir = path.join('public', subfolder, fieldName);

  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `local-${fieldName}-${uniqueSuffix}${ext}`);
    },
  });

  return FileInterceptor('file', {
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(
          new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'),
          false,
        );
      }
      cb(null, true);
    },
  });
}
