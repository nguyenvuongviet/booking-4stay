import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitize(location: any) {
  if (!location) return null;

  return {
    id: location.id,
    province: location.province,
    provinceImageUrl: buildImageUrl(location.provinceImageUrl),
    district: location.district,
    ward: location.ward,
    street: location.street,
    fullAddress: `${location.street}, ${location.ward}, ${location.district}, ${location.province}`,
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

export function sanitizeLocation(data: any) {
  return sanitizeCollection(data, sanitize);
}
