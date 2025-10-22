import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "@/config/api";
import { authHeader, clearToken } from "@/utils/auth";

const api = axios.create({ baseURL: API_CONFIG.BASE_URL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const headers =
    config.headers instanceof AxiosHeaders
      ? config.headers
      : new AxiosHeaders(config.headers);

  const auth = authHeader();
  if (auth.Authorization) headers.set("Authorization", auth.Authorization);

  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (window.location.pathname !== "/login")
        window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
