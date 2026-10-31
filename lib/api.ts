import axios from "axios";
import { clearSession, getToken } from "@/lib/auth";

// Create an Axios instance with default configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Send the admin token with every request (when there is a valid session).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

// Global error handling.
// A 401 with the message "Unauthorized" means the token is missing, invalid or
// expired: clear the session and show the login page. Other 401 answers (wrong
// password at login or in settings) keep their own message.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    if (status === 401 && message === "Unauthorized" && typeof window !== "undefined") {
      clearSession();
      if (window.location.pathname !== "/") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full page load clears every trace of the expired session
        window.location.assign("/");
      }
    }
    console.error("API Error:", error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);
