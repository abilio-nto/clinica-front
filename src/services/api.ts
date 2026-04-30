import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8081",
});

// ✅ ENVIA TOKEN
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🚨 TRATA TOKEN EXPIRADO
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 🔥 remove token inválido
      localStorage.removeItem("token");

      // 🔥 redireciona pro login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);