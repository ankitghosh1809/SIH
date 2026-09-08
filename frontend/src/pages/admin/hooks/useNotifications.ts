import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import type { NotificationResponse } from "@/types/api";

export function useNotifications(unreadOnly: boolean) {
  return useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: async () => {
      const { data } = await api.get<NotificationResponse[]>("/api/v1/notifications", {
        params: { unread_only: unreadOnly },
      });
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<NotificationResponse>(`/api/v1/notifications/${id}/read`);
      return data;
    },
    // Invalidates both the unread_only=true and unread_only=false query keys
    // (react-query matches on the ["notifications"] prefix by default).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
