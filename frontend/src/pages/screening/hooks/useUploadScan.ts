import { useMutation } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { api } from "@/lib/api-client";
import type { ScanResponse } from "@/types/api";

interface UploadScanArgs {
  file: File;
  patientName?: string;
  patientId?: string;
  onProgress?: (percent: number) => void;
}

async function uploadScan({
  file,
  patientName,
  patientId,
  onProgress,
}: UploadScanArgs): Promise<ScanResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (patientName?.trim()) formData.append("patient_name", patientName.trim());
  if (patientId) formData.append("patient_id", patientId);

  const { data } = await api.post<ScanResponse>("/api/v1/scans", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export function useUploadScan() {
  return useMutation({ mutationFn: uploadScan });
}
