import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitize(location: any) {
  if (!location) return null;

  return {
    id: location.id,
    name: location.name,
    code: location.code ?? null,

    countryId: location.countryId ?? null,
    provinceId: location.provinceId ?? null,

    country:
      typeof location.location_countries === 'object'
        ? location.location_countries?.name
        : (location.country ?? null),
    province:
      typeof location.location_provinces === 'object'
        ? location.location_provinces?.name
        : (location.province ?? null),

    imageUrl: buildImageUrl(location.imageUrl),
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
  };
}

export function sanitizeLocation(data: any) {
  return sanitizeCollection(data, sanitize);
}
