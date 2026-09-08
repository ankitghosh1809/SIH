import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { RiskBadge } from "@/components/RiskBadge";
import { ROUTES } from "@/lib/routes";
import type { PatientScanSummary } from "@/types/api";
import { usePatient, usePatientScans, usePatientTrend } from "./hooks";

function formatProbability(value: number | null): string {
  if (value === null || value === undefined) return "no data";
  return `${Math.round(value * 100)}%`;
}

function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

const scanColumnHelper = createColumnHelper<PatientScanSummary>();

// Static column defs — no dependency on component state/props, so this
// lives at module scope rather than needing a useMemo inside the
// component (see PatientDetailPage below for why hook order matters here).
const scanColumns = [
  scanColumnHelper.accessor("created_at", {
    header: "Date",
    cell: (info) => (
      <Link
        to={ROUTES.scanDetail(info.row.original.scan_id)}
        className="font-medium text-foreground hover:underline"
      >
        {format(new Date(info.getValue()), "d MMM yyyy, HH:mm")}
      </Link>
    ),
  }),
  scanColumnHelper.accessor("risk_level", {
    header: "Risk level",
    cell: (info) => {
      const level = info.getValue();
      return level ? <RiskBadge level={level} /> : <span className="text-muted-foreground">no data</span>;
    },
  }),
  scanColumnHelper.accessor("dr_probability", {
    header: "DR risk",
    cell: (info) => formatProbability(info.getValue()),
  }),
  scanColumnHelper.accessor("cataract_probability", {
    header: "Cataract risk",
    cell: (info) => formatProbability(info.getValue()),
  }),
];

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // All hooks are called unconditionally, before any early return below —
  // calling useReactTable (or any hook) only on a successful-fetch branch
  // would break the rules of hooks.
  const patientQuery = usePatient(id);
  const scansQuery = usePatientScans(id);
  const trendQuery = usePatientTrend(id);

  const scanTable = useReactTable({
    data: scansQuery.data ?? [],
    columns: scanColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (patientQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (patientQuery.isError || !patientQuery.data) {
    const notFound = isNotFound(patientQuery.error);
    return (
      <div className="mx-auto max-w-4xl p-6">
        <ErrorState
          title={notFound ? "Patient not found" : "Couldn't load this patient"}
          description={
            notFound
              ? "This patient may have been removed, or the link is incorrect."
              : "Something went wrong while contacting the server."
          }
          action={
            <Button asChild variant="outline">
              <Link to={ROUTES.patients}>Back to patients</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const patient = patientQuery.data;
  const trendPoints = trendQuery.data?.points ?? [];
  const hasEnoughTrendData = trendPoints.length >= 2;
  const chartData = trendPoints.map((point) => ({
    date: format(new Date(point.created_at), "d MMM yyyy"),
    drProbability: point.dr_probability,
    cataractProbability: point.cataract_probability,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        to={ROUTES.patients}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{patient.full_name}</CardTitle>
          <CardDescription>
            Registered {format(new Date(patient.created_at), "d MMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Age</dt>
              <dd className="font-medium text-foreground">{patient.age ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gender</dt>
              <dd className="font-medium text-foreground">{patient.gender ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium text-foreground">{patient.phone ?? "Not provided"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Diabetes type</dt>
              <dd className="font-medium text-foreground">
                {patient.diabetes_type ?? "Not provided"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scan history</CardTitle>
          <CardDescription>All screenings recorded for this patient, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          {scansQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : scansQuery.isError ? (
            <ErrorState
              title="Couldn't load scan history"
              description="Something went wrong while contacting the server."
            />
          ) : scansQuery.data && scansQuery.data.length === 0 ? (
            <EmptyState
              title="No scans for this patient yet"
              description="Screenings uploaded for this patient will appear here."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  {scanTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {scanTable.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => navigate(ROUTES.scanDetail(row.original.scan_id))}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk level history</CardTitle>
          <CardDescription>
            Screening risk levels over time for this patient. This is a screening /
            decision-support aid, not a diagnosis. Always confirm findings with a
            qualified clinician.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : trendQuery.isError ? (
            <ErrorState
              title="Couldn't load risk history"
              description="Something went wrong while contacting the server."
            />
          ) : !hasEnoughTrendData ? (
            <EmptyState
              title="Trend appears after at least two screenings"
              description={
                trendPoints.length === 0
                  ? "This patient has no recorded screenings yet."
                  : "This patient has one recorded screening so far. Screen again to see a risk trend over time."
              }
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
                  tick={{ fontSize: 12 }}
                  width={48}
                  label={{
                    value: "Risk probability",
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 12 },
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    value === null || value === undefined
                      ? "No data"
                      : `${Math.round(Number(value) * 100)}%`,
                    String(name),
                  ]}
                  labelFormatter={(label) => `Screening on ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="drProbability"
                  name="Diabetic retinopathy risk"
                  stroke="#dc2626"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="cataractProbability"
                  name="Cataract risk"
                  stroke="#2563eb"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
