import { sanitizeCollection } from '../object.util';

function sanitize(amenity: any) {
  return {
    id: amenity.id,
    name: amenity.name,
    description: amenity.description,
    category: amenity.category,
  };
}

export function sanitizeAmenity(data: any) {
  return sanitizeCollection(data, sanitize);
}
