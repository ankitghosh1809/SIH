/**
 * Intended path: frontend/src/lib/apiClient.ts
 *
 * Single axios instance for all API calls. Attaches auth to every
 * outgoing request and routes every failure through one place (tasks 2
 * and 4) — no individual page should be handling 401s or API errors on
 * its own.
 *
 * ASSUMPTION — UNVERIFIED: base URL below and the bearer-token approach
 * from auth-utils.ts. Confirm both against the real backend (Agent 2's
 * API contract doc is the source of truth once it exists) and adjust.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken, redirectToLogin } from './auth-utils';
import { handleApiError } from './errorHandler';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  // withCredentials: true, // uncomment instead of the token header below if the backend uses cookie sessions
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Expired/invalid auth: one path, everywhere (task 2) — clear
      // local state and bounce to login instead of leaving each page
      // to fend for itself.
      clearToken();
      redirectToLogin();
      return Promise.reject(error);
    }
    handleApiError(error);
    return Promise.reject(error);
  }
);
