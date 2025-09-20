import axios from "axios";

type TConfig = {
  headers: any;
};

import { STORAGE_KEYS } from "../constants";

const api = axios.create({
  baseURL: "http://localhost:3069",
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
