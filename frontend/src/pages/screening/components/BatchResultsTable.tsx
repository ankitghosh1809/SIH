import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { RiskBadge } from "@/components/RiskBadge";
import { ROUTES } from "@/lib/routes";
import type { BatchItemResult } from "@/types/api";

const columnHelper = createColumnHelper<BatchItemResult>();

export function BatchResultsTable({ results }: { results: BatchItemResult[] }) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("filename", {
        header: "File",
        cell: (info) => <span className="font-medium text-slate-700">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: "outcome",
        header: "Result",
        cell: ({ row }) => {
          const { risk_level, error } = row.original;
          if (error) return <span className="text-sm text-red-700">{error}</span>;
          if (risk_level) return <RiskBadge level={risk_level} />;
          return <span className="text-sm text-slate-400">Pending</span>;
        },
      }),
      columnHelper.display({
        id: "link",
        header: "",
        cell: ({ row }) => {
          const { scan_id } = row.original;
          if (!scan_id) return null;
          return (
            <Link
              to={ROUTES.scanDetail(scan_id)}
              className="text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
            >
              View scan
            </Link>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({ data: results, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 font-medium text-slate-600">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
