import { useEffect, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLogResponse } from "@/types/api";

import { useAuditLogs } from "./hooks/useAuditLogs";

const NA = "n/a";

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);
  return debounced;
}

function formatTimestamp(value: string | null): string {
  if (!value) return NA;
  try {
    return format(new Date(value), "d MMM yyyy, HH:mm:ss");
  } catch {
    return NA;
  }
}

// No Resource column: the live AuditLogResponse never sends resource_type / resource_id
// (see the note in src/types/api.ts) despite the work order's stub including them.
const columns: ColumnDef<AuditLogResponse>[] = [
  { accessorKey: "actor", header: "Actor", cell: (info) => info.getValue<string | null>() ?? NA },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "ip_address", header: "IP address", cell: (info) => info.getValue<string | null>() ?? NA },
  {
    accessorKey: "created_at",
    header: "Timestamp",
    cell: (info) => formatTimestamp(info.getValue<string | null>()),
  },
];

export default function AuditLogPage() {
  const [actionInput, setActionInput] = useState("");
  const debouncedAction = useDebouncedValue(actionInput, 300);
  const { data, isLoading, isFetching, isError } = useAuditLogs(debouncedAction);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Audit log</h1>
        <Input
          value={actionInput}
          onChange={(e) => setActionInput(e.target.value)}
          placeholder="Filter by action..."
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Requests
            {isFetching && !isLoading && <span className="font-normal text-neutral-400">refreshing...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState
              title="Couldn't load the audit log"
              description="Something went wrong fetching audit entries. Try refreshing the page."
            />
          ) : (data ?? []).length === 0 ? (
            <EmptyState
              title={debouncedAction ? "No matching entries" : "No audit entries yet"}
              description={
                debouncedAction
                  ? `Nothing matches "${debouncedAction}". Try a different action filter.`
                  : "Requests to the API will show up here as they happen."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
