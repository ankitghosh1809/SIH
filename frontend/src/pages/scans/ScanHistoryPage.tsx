import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RiskBadge } from "@/components/RiskBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROUTES } from "@/lib/routes";
import type { ScanListItem } from "@/types/api";
import { apiUrl, useScanList } from "./useScan";
import { formatTimestamp } from "./format";

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<ScanListItem>();

const columns = [
  columnHelper.accessor("thumbnail_url", {
    header: "Scan",
    cell: (info) => (
      <img
        src={apiUrl(info.getValue())}
        alt=""
        className="h-12 w-12 rounded-[var(--radius)] border border-border object-cover"
      />
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Date",
    cell: (info) => (
      <span className="text-foreground">{formatTimestamp(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("risk_level", {
    header: "Risk level",
    cell: (info) => <RiskBadge level={info.getValue()} />,
  }),
];

export default function ScanHistoryPage() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, isLoading, isError, isFetching } = useScanList(limit);
  const navigate = useNavigate();

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const goToScan = (scanId: string) => navigate(ROUTES.scanDetail(scanId));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-foreground">Scan history</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Past screenings and their risk level. Select a scan to see the full result.
      </p>

      <div className="mt-6">
        {isLoading ? (
          <HistorySkeleton />
        ) : isError ? (
          <p className="rounded-[var(--radius)] border border-border bg-muted/40 p-6 text-sm text-muted-foreground">
            Couldn't load scan history. Check your connection and try again.
          </p>
        ) : (data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No scans yet"
            description="Upload a retinal photo to run your first screening."
            action={
              <Button asChild size="sm">
                <Link to={ROUTES.upload}>Upload a scan</Link>
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    tabIndex={0}
                    role="link"
                    aria-label={`View scan from ${formatTimestamp(row.original.created_at)}, risk level ${row.original.risk_level}`}
                    onClick={() => goToScan(row.original.scan_id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToScan(row.original.scan_id);
                      }
                    }}
                    className="cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
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

            {data && data.length === limit && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  disabled={isFetching}
                  onClick={() => setLimit((current) => current + PAGE_SIZE)}
                >
                  {isFetching ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
