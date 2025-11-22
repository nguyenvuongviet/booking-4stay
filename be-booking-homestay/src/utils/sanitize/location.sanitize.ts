import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitize(location: any) {
  if (!location) return null;

  return {
    id: location.id,
    name: location.name,
    code: location.code ?? null,

    countryId: location.countryId ?? null,
    provinceId: location.provinceId ?? null,
    districtId: location.districtId ?? null,

    country: location.country ?? null,
    province: location.province ?? null,
    district: location.district ?? null,

    imageUrl: buildImageUrl(location.imageUrl),
  };
}

export function sanitizeLocation(data: any) {
  return sanitizeCollection(data, sanitize);
}
