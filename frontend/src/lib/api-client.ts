import axios from "axios";
import { handleApiError } from "./errorHandler";

// AuthContext reads/writes the token under this key; kept here (not
// hardcoded twice) since api-client.ts is the module that actually reads it
// on every request.
export const TOKEN_STORAGE_KEY = "sih_token";

// In the Vercel deployment the FastAPI function is rewritten under this same
// origin, so a relative base URL avoids a separate backend host and CORS
// configuration.  Keeping a non-placeholder override makes local development
// and an intentionally separate API deployment possible too.
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
const apiBaseUrl =
  configuredApiBaseUrl === "https://your-backend.vercel.app"
    ? ""
    : configuredApiBaseUrl || "";

// Exported shape every other agent imports.
export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AuthContext registers a callback here on mount so a 401 from anywhere in
// the app can trigger logout, without this module importing AuthContext
// (that would be a circular import: AuthContext -> api-client -> AuthContext).
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: (() => void) | null) {
  onUnauthorized = callback;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      onUnauthorized?.();
    } else {
      handleApiError(error);
    }
    return Promise.reject(error);
  }
);
