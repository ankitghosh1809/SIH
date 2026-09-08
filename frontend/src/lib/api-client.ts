import axios from "axios";

// AuthContext reads/writes the token under this key; kept here (not
// hardcoded twice) since api-client.ts is the module that actually reads it
// on every request.
export const TOKEN_STORAGE_KEY = "sih_token";

// Exported shape every other agent imports.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    }
    return Promise.reject(error);
  }
);
