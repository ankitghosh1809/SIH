import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePatientSearch } from "../hooks/usePatientSearch";

interface PatientLinkFieldProps {
  value: string | undefined;
  onChange: (patientId: string | undefined) => void;
  disabled?: boolean;
}

export function PatientLinkField({ value, onChange, disabled }: PatientLinkFieldProps) {
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const { results, isLoading } = usePatientSearch(value ? "" : query);

  if (value && selectedLabel) {
    return (
      <div className="space-y-1.5">
        <Label>Linked patient</Label>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-700">{selectedLabel}</span>
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setSelectedLabel(null);
              setQuery("");
            }}
            disabled={disabled}
            className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
          >
            Unlink
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-1.5">
      <Label htmlFor="patientSearch">Link to an existing patient (optional)</Label>
      <Input
        id="patientSearch"
        placeholder="Search by patient name"
        value={query}
        disabled={disabled}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      {query.trim().length >= 2 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-md">
          {isLoading && <p className="px-3 py-2 text-sm text-slate-500">Searching...</p>}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500">No matching patients found.</p>
          )}
          {!isLoading &&
            results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => {
                  onChange(patient.id);
                  setSelectedLabel(patient.full_name);
                  setQuery("");
                }}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                {patient.full_name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
