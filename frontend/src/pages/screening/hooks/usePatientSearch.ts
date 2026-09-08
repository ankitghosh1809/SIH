import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { PatientResponse } from "@/types/api";

// Response shape corrected against the real, now-merged Patient Registry
// contract (app/schemas_patient.py / src/types/api.ts): GET /api/v1/patients
// returns PatientResponse[] — `id` + `full_name`, not the placeholder
// `{patient_id, name}` shape this hook was built against before that
// contract existed.
export type PatientSearchResult = PatientResponse;

export function usePatientSearch(query: string, debounceMs = 300) {
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get<PatientSearchResult[]>("/api/v1/patients", {
          params: { search: trimmed },
        });
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [query, debounceMs]);

  return { results, isLoading };
}
