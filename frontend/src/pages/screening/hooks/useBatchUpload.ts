import { useMutation } from "@tanstack/react-query";
import type { AxiosProgressEvent } from "axios";
import { api } from "@/lib/api-client";
import type { BatchResponse } from "@/types/api";

interface UploadBatchArgs {
  files: File[];
  onProgress?: (percent: number) => void;
}

async function uploadBatch({ files, onProgress }: UploadBatchArgs): Promise<BatchResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const { data } = await api.post<BatchResponse>("/api/v1/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export function useBatchUpload() {
  return useMutation({ mutationFn: uploadBatch });
}
