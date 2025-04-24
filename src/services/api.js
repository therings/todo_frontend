import axios from "axios";

// API URL configuration with fallback
const API_URL = process.env.REACT_APP_API_URL?.endsWith("/")
  ? process.env.REACT_APP_API_URL.slice(0, -1)
  : process.env.REACT_APP_API_URL ||
    "https://todo-backend-nine-wine.vercel.app";

// Create a custom axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: false, // Disable withCredentials since we're using token-based auth
});

// ... existing code ...
