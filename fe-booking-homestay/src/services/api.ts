import axios from "axios";

type TConfig = {
  headers: any;
};

import { API_BASE_URL } from "@/constants/app.constant";
import { STORAGE_KEYS } from "../constants";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config: any) => {
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

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không có response (lỗi mạng) hoặc request đã retry rồi thì reject luôn
    if (!error.response || originalRequest._retry) {
      if (error.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        if (typeof window !== "undefined") {
          const isAdminPath = window.location.pathname.startsWith("/admin");
          if (isAdminPath) {
            window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
          } else {
            window.location.href = "/";
          }
        }
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 401 hoặc 403 với nội dung "jwt expired" tương ứng với token hết hạn
    const isTokenExpired =
      status === 401 ||
      (status === 403 &&
        (error.response?.data?.message === "jwt expired" ||
          error.response?.data?.message?.includes("expired")));

    if (isTokenExpired) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (!currentUser) throw new Error("No user in storage");

        const { accessToken, refreshToken } = JSON.parse(currentUser);

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          accessToken,
          refreshToken,
        });

        const newTokens = res.data.data;
        const updatedUser = {
          ...JSON.parse(currentUser),
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        };

        localStorage.setItem(
          STORAGE_KEYS.CURRENT_USER,
          JSON.stringify(updatedUser),
        );

        onRefreshed(newTokens.accessToken);
        isRefreshing = false;

        originalRequest.headers["Authorization"] =
          `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        if (typeof window !== "undefined") {
          const isAdminPath = window.location.pathname.startsWith("/admin");
          if (isAdminPath) {
            window.location.href = `/auth/login?next=${encodeURIComponent(window.location.pathname)}`;
          } else {
            window.location.href = "/";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Nếu là 403 (Forbidden) thì chỉ reject để component tự hiển thị thông báo "Không có quyền"
    // KHÔNG logout ở đây vì user vẫn đang đăng nhập đúng, chỉ là không có quyền thực hiện hành động này.

    return Promise.reject(error);
  },
);

export default api;
