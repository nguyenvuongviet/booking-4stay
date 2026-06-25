import api from "./api";

export const publicConfigApi = {
  getPublicConfigs: async () => {
    const res = await api.get("/app-configs/public");
    return res.data?.data;
  },
};
