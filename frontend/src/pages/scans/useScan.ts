import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "@/lib/api-client";
import type {
  ExplainResponse,
  ReferralSuggestion,
  ScanListItem,
  ScanResponse,
} from "@/types/api";

/**
 * Prefixes a relative backend path with VITE_API_BASE_URL for use in raw
 * <img src> / <a href> attributes, which don't go through the axios
 * instance's baseURL. Mirrors src/lib/api-client.ts's own fallback.
 */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
  return `${base}${path}`;
}

export function useScanList(limit: number) {
  return useQuery({
    queryKey: ["scans", "list", limit],
    queryFn: async () => {
      const { data } = await api.get<ScanListItem[]>("/api/v1/scans", {
        params: { limit },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useScanDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["scans", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<ScanResponse>(`/api/v1/scans/${id}`);
      return data;
    },
    enabled: !!id,
    retry: (failureCount, error) => {
      if ((error as AxiosError)?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useScanExplain(id: string | undefined) {
  return useQuery({
    queryKey: ["scans", "explain", id],
    queryFn: async () => {
      const { data } = await api.get<ExplainResponse>(`/api/v1/scans/${id}/explain`);
      return data;
    },
    enabled: !!id,
  });
}

export function useReferralSuggestion(id: string | undefined) {
  return useQuery({
    queryKey: ["scans", "referral-suggestion", id],
    queryFn: async () => {
      const { data } = await api.get<ReferralSuggestion>(
        `/api/v1/scans/${id}/referral-suggestion`
      );
      return data;
    },
    enabled: !!id,
    retry: false,
  });
}
