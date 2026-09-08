import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { AuditLogResponse } from "@/types/api";

export function useAuditLogs(action: string, limit = 50) {
  return useQuery({
    queryKey: ["audit-logs", action, limit],
    queryFn: async () => {
      const { data } = await api.get<AuditLogResponse[]>("/api/v1/audit/logs", {
        params: { action: action || undefined, limit },
      });
      return data;
    },
    placeholderData: (prev) => prev, // keep the table populated while a new filter loads
  });
}
