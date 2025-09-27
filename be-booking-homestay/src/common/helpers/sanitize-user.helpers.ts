import { CLOUDINARY_BASE_URL, PORT } from '../constant/app.constant';
import { omitFields } from './omitFields.helpers';

const BASE_URL = `http://localhost:${PORT}`;
const AVATAR_PATH = '/public/images/avatar';

const SENSITIVE_FIELDS = [
  'roleId',
  'password',
  'googleId',
  'deletedBy',
  'isDeleted',
  'deletedAt',
  'createdAt',
  'updatedAt',
  'lastLogin',
];

function buildAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;

  if (avatar.startsWith('4stay/')) {
    return `${CLOUDINARY_BASE_URL}/${avatar}.jpg`;
  }

  return `${BASE_URL}${AVATAR_PATH}/${avatar}`;
}

function sanitize(user: any) {
  if (!user) return null;
  
  if (user.dateOfBirth instanceof Date) {
    user.dateOfBirth = user.dateOfBirth.toISOString();
  }

  const clone = omitFields(user, SENSITIVE_FIELDS);

  clone.avatar = buildAvatarUrl(user.avatar);

  return clone;
}

export function sanitizeUserData(data: any): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(sanitize) : sanitize(data);
}
