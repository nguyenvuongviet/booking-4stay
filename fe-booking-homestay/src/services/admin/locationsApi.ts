import api from "../api";

export type LocationType = "country" | "province" | "district" | "ward";

export interface BaseLocation {
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
}

export async function getCountries(): Promise<BaseLocation[]> {
  try {
    const res = await api.get("/location/countries");
    return res.data?.data.items ?? [];
  } catch (err) {
    console.error("Get Countries error:", err);
    throw err;
  }
}

export async function getProvinces(
  countryId?: number
): Promise<BaseLocation[]> {
  try {
    const res = await api.get("/location/provinces", {
      params: countryId ? { countryId } : {},
    });
    return res.data?.data.items ?? [];
  } catch (err) {
    console.error("Get Provinces error:", err);
    throw err;
  }
}

export async function getDistricts(
  provinceId?: number
): Promise<BaseLocation[]> {
  try {
    const res = await api.get("/location/districts", {
      params: provinceId ? { provinceId } : {},
    });
    return res.data?.data.items ?? [];
  } catch (err) {
    console.error("Get Districts error:", err);
    throw err;
  }
}

export async function getWards(districtId?: number): Promise<BaseLocation[]> {
  try {
    const res = await api.get("/location/wards", {
      params: districtId ? { districtId } : {},
    });
    return res.data?.data.items ?? [];
  } catch (err) {
    console.error("Get Wards error:", err);
    throw err;
  }
}

export async function getLocationsByType(
  type: LocationType,
  parentId?: number
): Promise<BaseLocation[]> {
  try {
    switch (type) {
      case "country":
        return await getCountries();
      case "province":
        return await getProvinces(parentId);
      case "district":
        return await getDistricts(parentId);
      case "ward":
        return await getWards(parentId);
      default:
        return [];
    }
  } catch (err) {
    console.error("getLocationsByType error:", err);
    throw err;
  }
}

const typeToEndpointMap: Record<LocationType, string> = {
  country: "countries",
  province: "provinces",
  district: "districts",
  ward: "wards",
};

export async function createLocation(
  type: LocationType,
  payload: Record<string, any>
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
  payload: Record<string, any>
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
  id: number
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
  file: File
): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.put(
      `/location/admin/provinces/${id}/image`,
      formData
    );

    return res.data?.data?.imgUrl ?? "";
  } catch (err) {
    console.error("Upload Province Image error:", err);
    throw err;
  }
}

export async function importLocations(file: File): Promise<void> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/location/admin/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (err) {
    console.error("Import Locations error:", err);
    throw err;
  }
}
