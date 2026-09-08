import { useEffect, useState } from "react";
import axios from "axios";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type {
  PatientCreate,
  PatientResponse,
  PatientScanSummary,
  TrendResponse,
} from "@/types/api";

/**
 * Debounces a fast-changing value; the returned value only updates
 * after `delay` ms have passed without a new change. Used so the
 * patient search box doesn't fire a request on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function usePatients(search: string) {
  const trimmed = search.trim();
  return useQuery({
    queryKey: ["patients", { search: trimmed }],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse[]>("/api/v1/patients", {
        params: {
          limit: 20,
          ...(trimmed ? { search: trimmed } : {}),
        },
      });
      return data;
    },
    // Keep the previous results on screen while a new search resolves,
    // instead of flashing empty on every keystroke.
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse>(`/api/v1/patients/${id}`);
      return data;
    },
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      // Don't retry a 404 — the patient genuinely doesn't exist.
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function usePatientScans(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id, "scans"],
    queryFn: async () => {
      const { data } = await api.get<PatientScanSummary[]>(
        `/api/v1/patients/${id}/scans`
      );
      return data;
    },
    enabled: Boolean(id),
  });
}

export function usePatientTrend(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id, "trend"],
    queryFn: async () => {
      const { data } = await api.get<TrendResponse>(`/api/v1/patients/${id}/trend`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PatientCreate) => {
      const { data } = await api.post<PatientResponse>("/api/v1/patients", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
