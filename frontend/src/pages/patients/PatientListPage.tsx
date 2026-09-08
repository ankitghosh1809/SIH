import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ROUTES } from "@/lib/routes";
import type { PatientResponse } from "@/types/api";
import { useDebouncedValue, usePatients } from "./hooks";

const columnHelper = createColumnHelper<PatientResponse>();

const columns = [
  columnHelper.accessor("full_name", {
    header: "Name",
    cell: (info) => (
      <Link
        to={ROUTES.patientDetail(info.row.original.id)}
        className="font-medium text-foreground hover:underline"
      >
        {info.getValue()}
      </Link>
    ),
  }),
  columnHelper.accessor("age", {
    header: "Age",
    cell: (info) => info.getValue() ?? <span className="text-muted-foreground">-</span>,
  }),
  columnHelper.accessor("gender", {
    header: "Gender",
    cell: (info) => info.getValue() ?? <span className="text-muted-foreground">-</span>,
  }),
  columnHelper.accessor("diabetes_type", {
    header: "Diabetes type",
    cell: (info) => info.getValue() ?? <span className="text-muted-foreground">-</span>,
  }),
  columnHelper.accessor("created_at", {
    header: "Registered",
    cell: (info) => format(new Date(info.getValue()), "d MMM yyyy"),
  }),
];

export default function PatientListPage() {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const navigate = useNavigate();

  const { data: patients, isLoading, isError, refetch } = usePatients(debouncedSearch);

  const table = useReactTable({
    data: patients ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">
            Search the registry or register a new patient for screening.
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.newPatient}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add patient
          </Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search patients by name"
          aria-label="Search patients by name"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Couldn't load patients"
          description="Something went wrong while contacting the server."
          action={<Button onClick={() => refetch()}>Try again</Button>}
        />
      ) : patients && patients.length === 0 ? (
        <EmptyState
          title={isSearching ? "No matching patients" : "No patients yet"}
          description={
            isSearching
              ? "Try a different name, or clear the search to see the most recently registered patients."
              : "Register your first patient to start screening."
          }
          action={
            !isSearching && (
              <Button asChild>
                <Link to={ROUTES.newPatient}>Add patient</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-lg border">
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
                  className="cursor-pointer"
                  onClick={() => navigate(ROUTES.patientDetail(row.original.id))}
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
    </div>
  );
}
