export interface Location {
  id: number;
  name: string;
  code?: string;
  countryId?: number;
  provinceId?: number;
  country?: string;
  province?: string;
  imageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
