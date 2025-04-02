import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Session management functions - all endpoints are now under /api/ prefix
api.getSessions = () => api.get("/api/sessions/");
api.createSession = (title) => api.post("/api/sessions/", { title });
api.getSession = (sessionId) => api.get(`/api/sessions/${sessionId}/`);
api.updateSessionTitle = (sessionId, title) =>
  api.patch(`/api/sessions/${sessionId}/`, { title });
api.deleteSession = (sessionId) => api.delete(`/api/sessions/${sessionId}/`);
api.addQueryToSession = (sessionId, prompt, response) =>
  api.post(`/api/sessions/${sessionId}/queries/`, { prompt, response });

export default api;
