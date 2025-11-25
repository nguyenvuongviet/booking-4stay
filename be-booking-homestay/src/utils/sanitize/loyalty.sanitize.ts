import { sanitizeCollection } from 'src/utils/object.util';

function sanitize(loyalty: any) {
  if (!loyalty) return null;

  return {
    id: loyalty.id,
    name: loyalty.name,
    minPoints: loyalty.minPoints,
    description: loyalty.description,
    isActive: loyalty.isActive,
  };
}

export function sanitizeLoyalty(data: any) {
  return sanitizeCollection(data, sanitize);
}
