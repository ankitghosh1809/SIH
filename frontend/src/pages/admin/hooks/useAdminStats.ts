import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { AdminStatsResponse } from "@/types/api";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get<AdminStatsResponse>("/api/v1/admin/stats");
      return data;
    },
    // A 403 means "not an admin" — retrying won't change that outcome.
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403) return false;
      return failureCount < 2;
    },
  });
}
