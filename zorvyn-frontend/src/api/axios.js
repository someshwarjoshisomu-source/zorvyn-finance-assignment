import axios from "axios";

const api = axios.create({
  baseURL: "https://zorvyn-finance-assignment-gh7d.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;