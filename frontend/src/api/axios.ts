import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "https://api-key-management-portal.vercel.app/";

const api = axios.create({
  baseURL,
});

// Attach token to each request if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;
