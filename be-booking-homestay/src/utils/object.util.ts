import { CLOUDINARY_BASE_URL, PORT } from 'src/common/constant/app.constant';

const fieldsToRemove = [
  'deletedBy',
  'isDeleted',
  'deletedAt',
  'createdAt',
  'updatedAt',
];

const BASE_URL = `http://localhost:${PORT}`;
const AVATAR_PATH = '/public/images/avatar';

export function cleanData(data: any) {
  const cleanObject = (obj: any): any => {
    const result: any = {};

    for (const key in obj) {
      if (fieldsToRemove.includes(key)) continue;

      const value = obj[key];

      if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? cleanObject(item) : item,
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = cleanObject(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === 'object' && item !== null ? cleanObject(item) : item,
    );
  }

  if (typeof data === 'object' && data !== null) {
    return cleanObject(data);
  }

  return data;
}

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

  return `${BASE_URL}${AVATAR_PATH}/${images}`;
}
