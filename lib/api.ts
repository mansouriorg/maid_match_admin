import axios from "axios";

// Create an Axios instance with default configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can log errors globally here
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);