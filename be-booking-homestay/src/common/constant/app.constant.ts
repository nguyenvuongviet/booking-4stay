import 'dotenv/config';

export const PORT = process.env.PORT;

export const DATABASE_URL = process.env.DATABASE_URL;

export const CLOUDINARY_BASE_URL = process.env.CLOUDINARY_BASE_URL;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES;

export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES;

export const SENDER_EMAIL = process.env.SENDER_EMAIL;
export const SENDER_PASSWORD = process.env.SENDER_PASSWORD;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

export const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID || '';
export const PAYOS_API_KEY = process.env.PAYOS_API_KEY || '';
export const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || '';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

console.log({
  PORT,
  DATABASE_URL,
  CLOUDINARY_BASE_URL,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES,
  SENDER_EMAIL,
  SENDER_PASSWORD,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  PAYOS_CLIENT_ID,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY,
  ADMIN_EMAIL,
  CLIENT_URL,
});
