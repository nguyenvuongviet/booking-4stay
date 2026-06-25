import api from "../api";

export type LocationType = "country" | "province" | "ward";

export interface BaseLocation {
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

export interface Meta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  message: string;
  items: T[];
  meta: Meta;
}

export interface LocationQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  countryId?: number;
  provinceId?: number;
}

export async function getCountries(
  params?: LocationQueryParams,
): Promise<PaginatedResponse<BaseLocation>> {
  try {
    const res = await api.get("/location/countries", { params });
    return res.data?.data;
  } catch (err) {
    console.error("Get Countries error:", err);
    throw err;
  }
}

export async function getProvinces(
  params?: LocationQueryParams,
): Promise<PaginatedResponse<BaseLocation>> {
  try {
    const res = await api.get("/location/provinces", { params });
    return res.data?.data;
  } catch (err) {
    console.error("Get Provinces error:", err);
    throw err;
  }
}

export async function getWards(
  params?: LocationQueryParams,
): Promise<PaginatedResponse<BaseLocation>> {
  try {
    const res = await api.get("/location/wards", { params });
    return res.data?.data;
  } catch (err) {
    console.error("Get Wards error:", err);
    throw err;
  }
}

export async function getLocationsByType(
  type: LocationType,
  params?: LocationQueryParams,
): Promise<PaginatedResponse<BaseLocation>> {
  try {
    switch (type) {
      case "country":
        return await getCountries(params);
      case "province":
        return await getProvinces(params);
      case "ward":
        return await getWards(params);
      default:
        throw new Error(`Invalid type: ${type}`);
    }
  } catch (err) {
    console.error("getLocationsByType error:", err);
    throw err;
  }
}

const typeToEndpointMap: Record<LocationType, string> = {
  country: "countries",
  province: "provinces",
  ward: "wards",
};

export async function createLocation(
  type: LocationType,
  payload: Record<string, any>,
): Promise<BaseLocation> {
  try {
    const endpointName = typeToEndpointMap[type];
    if (!endpointName) throw new Error(`Invalid location type: ${type}`);
    const res = await api.post(`/location/admin/${endpointName}`, payload);
    return res.data?.data;
  } catch (err) {
    console.error(`Create Location(${type}) error:`, err);
    throw err;
  }
}

export async function updateLocation(
  type: LocationType,
  id: number,
  payload: Record<string, any>,
): Promise<BaseLocation> {
  try {
    const res = await api.patch(`/location/admin/${type}/${id}`, payload);
    return res.data?.data;
  } catch (err) {
    console.error(`Update Location(${type}) error:`, err);
    throw err;
  }
}

export async function deleteLocation(
  type: LocationType,
  id: number,
): Promise<void> {
  try {
    await api.delete(`/location/admin/${type}/${id}`);
  } catch (err) {
    console.error(`Delete Location(${type}) error:`, err);
    throw err;
  }
}

export async function uploadProvinceImage(
  id: number,
  file: File,
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(
      `/location/admin/provinces/${id}/image`,
      formData,
    );

    return res.data?.data?.imgUrl ?? "";
  } catch (err) {
    console.error("Upload Province Image error:", err);
    throw err;
  }
}
