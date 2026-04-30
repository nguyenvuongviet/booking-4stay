import api from "./api";

export const get_location = async (countryId: number | string) => {
  try {
    const resp = await api.get(`/location/provinces`, {
      params: { countryId },
    });

    return resp.data?.data?.items || resp.data?.items || resp.data;
  } catch (error) {
    console.error("list location error: ", error);
    throw error;
  }
};

export const search_location = async (keyword: string) => {
  try {
    if (!keyword.trim()) {
      return { data: { data: [] } };
    }

    const resp = await api.get("/location/provinces/search", {
      params: {
        keyword: keyword.trim(),
      },
    });

    return {
      data: {
        data: Array.isArray(resp.data?.data?.data)
          ? resp.data.data.data
          : resp.data?.data || [],
      },
    };
  } catch (error) {
    console.error("search location error:", error);
    return { data: { data: [] } };
  }
};
