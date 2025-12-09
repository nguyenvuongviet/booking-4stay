import axios from "axios";

type TConfig = {
  headers: any;
};

import { API_BASE_URL } from "@/constants/app.constant";
import { STORAGE_KEYS } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config: TConfig) => {
  let token = "";
  const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (currentUser) {
    const parsed = JSON.parse(currentUser);
    token = parsed?.accessToken || "";
  }

  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${token}`,
  };
  return config;
});

export default api;
