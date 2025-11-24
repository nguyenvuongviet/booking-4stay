import { CLOUDINARY_BASE_URL, PORT } from 'src/common/constant/app.constant';

const BASE_URL = `http://localhost:${PORT}`;
const AVATAR_PATH = '/public/images/avatar';

export function sanitizeCollection<T>(
  data: T | T[],
  handler: (item: T) => any,
): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(handler) : handler(data);
}

export function buildImageUrl(images: string | null): string | null {
  if (!images) return null;

  if (images.startsWith('4stay/')) {
    return `${CLOUDINARY_BASE_URL}/${images}.jpg`;
  }

  return images;
}
