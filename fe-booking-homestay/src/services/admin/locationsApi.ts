import { CreateLocation } from "@/types/location";
import api from "../api";

export async function getAllProvinces(): Promise<string[]> {
  try {
    const res = await api.get("/location/provinces/list/all");
    console.log(res.data.data);

    return res.data.data;
  } catch (error) {
    console.error("Get list provinces error:", error);
    throw error;
  }
}

export async function getDistricts(province: string): Promise<string[]> {
  try {
    const res = await api.get(`/location/provinces/${province}/districts`);
    return res.data.data;
  } catch (error) {
    console.error("Get list districts error:", error);
    throw error;
  }
}

export async function getWards(
  province: string,
  district: string
): Promise<string[]> {
  try {
    const res = await api.get(
      `/location/provinces/${province}/districts/${district}/wards`
    );
    return res.data.data;
  } catch (error) {
    console.error("Get list wards error:", error);
    throw error;
  }
}

export async function createLocation(
  payload: CreateLocation
): Promise<{ id: number }> {
  const res = await api.post("/location/admin", payload);
  return res.data.data;
}
