const SENSITIVE_FIELDS = [
  'roleId',
  'password',
  'googleId',
  'provider',
  'deletedBy',
];

function sanitize(obj: any) {
  const clone = { ...obj };
  for (const field of SENSITIVE_FIELDS) {
    delete clone[field];
  }
  return clone;
}

export function sanitizeUserData(data: any): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(sanitize) : sanitize(data);
}
