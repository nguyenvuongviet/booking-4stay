import api from "../api";

export interface AppConfig {
  key: string;
  value: any;
  description: string | null;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export const appConfigApi = {
  getAllConfigs: async (): Promise<AppConfig[]> => {
    const response = await api.get("/app-configs");
    return response.data.data;
  },

  updateConfig: async (
    key: string,
    value: any,
    description?: string,
  ): Promise<AppConfig> => {
    const response = await api.patch(`/app-configs/${key}`, {
      value,
      description,
    });
    return response.data.data;
  },
};
