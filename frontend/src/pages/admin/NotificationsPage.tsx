import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { NotificationResponse } from "@/types/api";

import { useMarkNotificationRead, useNotifications } from "./hooks/useNotifications";

// event_type is a plain string on the backend — today it only ever generates these two, but
// anything else falls back to a generic label/icon rather than assuming the set is closed.
const KNOWN_EVENT_LABELS: Record<string, string> = {
  high_risk_detected: "High-risk scan detected",
  review_completed: "Review completed",
};
const KNOWN_EVENT_ICONS: Record<string, LucideIcon> = {
  high_risk_detected: AlertTriangle,
  review_completed: CheckCircle2,
};

function labelEventType(eventType: string): string {
  if (KNOWN_EVENT_LABELS[eventType]) return KNOWN_EVENT_LABELS[eventType];
  return eventType
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function iconForEventType(eventType: string): LucideIcon {
  return KNOWN_EVENT_ICONS[eventType] ?? Bell;
}

function formatTimestamp(value: string | null): string {
  if (!value) return "n/a";
  try {
    return format(new Date(value), "d MMM yyyy, HH:mm");
  } catch {
    return "n/a";
  }
}

function NotificationRow({ notification }: { notification: NotificationResponse }) {
  const markRead = useMarkNotificationRead();
  const Icon = iconForEventType(notification.event_type);

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
        notification.is_read ? "border-neutral-100 bg-white" : "border-blue-200 bg-blue-50/60"
      }`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${notification.is_read ? "text-neutral-400" : "text-blue-600"}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={notification.is_read ? "text-sm font-normal text-neutral-700" : "text-sm font-semibold text-neutral-900"}>
            {labelEventType(notification.event_type)}
          </p>
          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-sm text-neutral-600">{notification.message}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
          <span>{formatTimestamp(notification.created_at)}</span>
          <Badge variant="outline">{notification.channel}</Badge>
          {notification.scan_id && (
            // Raw string, not ROUTES.scanDetail — that constant lives in Agent 1's file, not
            // this stub, per the work order's explicit instruction for this link.
            <Link to={`/scans/${notification.scan_id}`} className="text-blue-600 hover:underline">
              View scan
            </Link>
          )}
        </div>
      </div>
      {!notification.is_read && (
        <Button variant="ghost" size="sm" onClick={() => markRead.mutate(notification.id)} disabled={markRead.isPending}>
          Mark read
        </Button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, isError } = useNotifications(unreadOnly);
  const markRead = useMarkNotificationRead();

  const unreadCount = (data ?? []).filter((n) => !n.is_read).length;

  // No bulk-read endpoint exists (only PATCH .../{id}/read), so "mark all" is N individual
  // mutations. Fine at this scale; worth a real bulk endpoint if notification volume grows.
  const handleMarkAllRead = () => {
    (data ?? []).filter((n) => !n.is_read).forEach((n) => markRead.mutate(n.id));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900">Notifications</h1>
          {unreadCount > 0 && <Badge className="bg-blue-600 text-white">{unreadCount} unread</Badge>}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <Switch checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            Unread only
          </label>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0 || markRead.isPending}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load notifications"
          description="Something went wrong fetching notifications. Try refreshing the page."
        />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={<Bell className="size-8" />}
          title={unreadOnly ? "No unread notifications" : "No notifications yet"}
          description={unreadOnly ? "You're all caught up." : "High-risk detections and completed reviews will show up here."}
        />
      ) : (
        <div className="space-y-3">
          {(data ?? []).map((notification) => (
            <NotificationRow key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
