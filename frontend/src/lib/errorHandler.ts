/**
 * Intended path: frontend/src/lib/errorHandler.ts
 *
 * Turns any backend error response into one sonner toast (task 4:
 * "one place... instead of each page handling errors its own way").
 *
 * ASSUMPTION — UNVERIFIED: the exact shape of backend error bodies.
 * This tries several common shapes ({message}, {error}, {detail},
 * {errors:[...]}) and falls back to a generic message rather than
 * throwing. Replace with the real shape once Agent 2's API contract
 * doc exists.
 */

import { AxiosError } from 'axios';
import { toast } from 'sonner';

interface NormalizedError {
  status?: number;
  message: string;
}

function extractMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.message === 'string') return d.message;
    if (typeof d.error === 'string') return d.error;
    if (typeof d.detail === 'string') return d.detail;
    if (Array.isArray(d.errors) && d.errors.length > 0) {
      const first = d.errors[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && typeof (first as Record<string, unknown>).message === 'string') {
        return (first as Record<string, unknown>).message as string;
      }
    }
  }
  return null;
}

export function normalizeError(error: unknown): NormalizedError {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosErr = error as AxiosError;
    const message =
      extractMessage(axiosErr.response?.data) ??
      axiosErr.message ??
      'Something went wrong. Please try again.';
    return { status: axiosErr.response?.status, message };
  }
  return { message: 'Something went wrong. Please try again.' };
}

export function handleApiError(error: unknown): void {
  const { status, message } = normalizeError(error);

  // 401 is handled by apiClient's interceptor (redirect to login) — don't double-toast it here.
  if (status === 401) return;

  if (status === 403) {
    toast.error("You don't have permission to do that.");
    return;
  }

  toast.error(message);
}
