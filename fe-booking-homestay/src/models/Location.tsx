export interface Location {
  id: number;
  name: string;
  code?: string;
  countryId?: number;
  provinceId?: number;
  districtId?: number;
  country?: string;
  province?: string;
  district?: string;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
