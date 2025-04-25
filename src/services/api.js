import axios from "axios";

// API URL configuration with fallback
const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-test-beta.vercel.app";

console.log("API Service - Using API URL:", API_URL);

// Create a custom axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Ensure withCredentials is false for CORS
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request interceptor to add auth token to all requests
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

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API error:", error);
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login page if not already there
      if (!window.location.pathname.includes("login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
