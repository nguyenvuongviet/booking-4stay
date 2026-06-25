import { PopularDestination } from "@/models/Destination";
import { Location } from "@/models/Location";
import api from "./api";

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

export async function getLocation(
  params?: LocationQueryParams,
): Promise<PaginatedResponse<Location>> {
  try {
    const res = await api.get("/location/provinces", { params });
    return res.data?.data;
  } catch (err) {
    console.error("Get Location error:", err);
    throw err;
  }
}

export async function search_location(
  params?: LocationQueryParams,
): Promise<PaginatedResponse<Location>> {
  try {
    const keyword = params?.search?.trim();

    if (!keyword) {
      return {
        message: "",
        items: [],
        meta: {
          currentPage: 1,
          totalItems: 0,
          totalPages: 1,
          itemsPerPage: 10,
        },
      };
    }

    const resp = await api.get("/location/provinces", {
      params: {
        search: keyword,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
      },
    });

    return resp.data?.data;
  } catch (error) {
    console.error("search location error:", error);

    return {
      message: "",
      items: [],
      meta: {
        currentPage: 1,
        totalItems: 0,
        totalPages: 1,
        itemsPerPage: 10,
      },
    };
  }
}

export async function searchProvince(keyword: string): Promise<any[]> {
  try {
    const resp = await api.get("/location/provinces/search", {
      params: { keyword },
    });
    return resp.data?.data.data || [];
  } catch (error) {
    console.error("search province by keyword error:", error);
    return [];
  }
}

export async function getPopularDestinations(
  limit = 10,
): Promise<PopularDestination[]> {
  try {
    const resp = await api.get(
      "/recommendation/popular-destinations",
      {
        params: { limit },
      },
    );

    return resp.data?.data || [];
  } catch (error) {
    console.error(
      "get popular destinations error:",
      error,
    );

    return [];
  }
}