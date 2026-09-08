import axios from "axios";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RiskLevel } from "@/types/api";

import { useAdminStats } from "./hooks/useAdminStats";

// Mirrors RiskBadge's own red/amber/green mapping so the chart and every badge elsewhere
// in the app read as the same semantic scale, not two different color systems.
const RISK_COLORS: Record<string, string> = {
  high: "#dc2626",
  medium: "#d97706",
  low: "#16a34a",
};
const DEFAULT_RISK_COLOR = "#6b7280";

function formatInferenceTime(ms: number | null): string {
  if (ms === null) return "no data yet";
  return `${Math.round(ms)} ms`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight text-neutral-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Admin dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    // The API itself 403s non-admins; ProtectedRoute should keep most people from ever
    // reaching this component, but this covers anyone who reaches the route another way.
    const isForbidden = axios.isAxiosError(error) && error.response?.status === 403;
    return (
      <div className="p-6">
        <ErrorState
          title={isForbidden ? "Admins only" : "Couldn't load the dashboard"}
          description={
            isForbidden
              ? "Your account doesn't have admin access, so these usage stats aren't visible."
              : "Something went wrong fetching admin stats. Try refreshing the page."
          }
        />
      </div>
    );
  }

  if (!data) return null;

  if (data.total_scans === 0) {
    return (
      <div className="p-6">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-900">Admin dashboard</h1>
        <EmptyState
          title="No scans yet"
          description="Usage stats will appear here once the first screening scan is uploaded."
        />
      </div>
    );
  }

  const riskData = Object.entries(data.by_risk_level).map(([level, count]) => ({ level, count }));
  const modelData = Object.entries(data.by_model_version).map(([version, count]) => ({ version, count }));

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Admin dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total scans" value={data.total_scans.toLocaleString()} />
        <StatCard label="Avg inference time" value={formatInferenceTime(data.avg_inference_ms)} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scans by risk level</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={riskData} dataKey="count" nameKey="level" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {riskData.map((entry) => (
                    <Cell key={entry.level} fill={RISK_COLORS[entry.level] ?? DEFAULT_RISK_COLOR} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-3">
              {riskData.map((entry) => (
                <div key={entry.level} className="flex items-center gap-2 text-sm">
                  <RiskBadge level={entry.level as RiskLevel} />
                  <span className="text-neutral-500">{entry.count.toLocaleString()} scans</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scans by model version</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={modelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="version" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-3 text-xs text-neutral-500">
              Tracks the classical-vs-hybrid-quantum split as the trained model rolls out.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
