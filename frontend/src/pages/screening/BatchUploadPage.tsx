import { useMemo, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import type { FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageDropzone } from "./components/ImageDropzone";
import { BatchResultsTable } from "./components/BatchResultsTable";
import { useBatchUpload } from "./hooks/useBatchUpload";
import { MAX_BATCH_SIZE, formatBytes } from "./lib/validation";
import type { BatchResponse } from "@/types/api";

type BatchState = "idle" | "uploading" | "processing" | "success" | "error";

export default function BatchUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [status, setStatus] = useState<BatchState>("idle");
  const [progress, setProgress] = useState(0);
  const [announcedProgress, setAnnouncedProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<BatchResponse | null>(null);

  const { mutateAsync } = useBatchUpload();

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const isBusy = status === "uploading" || status === "processing";
  const overBatchLimit = files.length > MAX_BATCH_SIZE;

  function addFiles(newFiles: File[]) {
    setFileError(null);
    setFiles((prev) => {
      const merged = [...prev, ...newFiles];
      if (merged.length > MAX_BATCH_SIZE) {
        setFileError(
          `You selected ${merged.length} images. Batch screening is limited to ${MAX_BATCH_SIZE} at a time. Remove ${
            merged.length - MAX_BATCH_SIZE
          } to continue.`,
        );
      }
      return merged;
    });
    setResult(null);
    setStatus("idle");
  }

  function handleFilesRejected(rejections: FileRejection[]) {
    setFileError(
      `${rejections.length} file${rejections.length > 1 ? "s were" : " was"} not accepted. Only image files can be screened.`,
    );
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clearAll() {
    setFiles([]);
    setFileError(null);
    setResult(null);
    setStatus("idle");
  }

  function handleProgress(percent: number) {
    setProgress(percent);
    setAnnouncedProgress((prev) => (percent - prev >= 10 || percent === 100 ? percent : prev));
    if (percent >= 100) setStatus("processing");
  }

  async function handleSubmit() {
    if (files.length === 0) {
      setFileError("Add at least one fundus image to run a batch screening.");
      return;
    }
    if (overBatchLimit) {
      setFileError(
        `You have ${files.length} images selected. Remove ${
          files.length - MAX_BATCH_SIZE
        } to stay within the ${MAX_BATCH_SIZE}-file limit.`,
      );
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setAnnouncedProgress(0);
    setErrorMessage(null);

    try {
      const response = await mutateAsync({ files, onProgress: handleProgress });
      setResult(response);
      setStatus("success");
      toast.success(
        `Batch complete. ${response.summary.succeeded} of ${response.summary.total} screened successfully.`,
      );
    } catch (error) {
      setStatus("error");
      const detail = axios.isAxiosError(error)
        ? (error.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setErrorMessage(detail ?? "The batch upload failed. Check your connection and try again.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Batch / camp screening</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload fundus photographs from a screening camp in one batch, up to {MAX_BATCH_SIZE}{" "}
          images. Each image is screened independently. This is a decision-support aid, not a
          diagnosis. Review flagged cases with a clinician.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>
            Drag in a folder's worth of photographs, or add them one at a time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageDropzone
            multiple
            disabled={isBusy}
            onFilesAccepted={addFiles}
            onFilesRejected={handleFilesRejected}
            helperText={`Up to ${MAX_BATCH_SIZE} images. JPEG, PNG, or WEBP.`}
          />

          {fileError && (
            <p role="alert" className="text-sm text-red-700">
              {fileError}
            </p>
          )}

          {files.length > 0 && (
            <div className="rounded-md border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <span
                  className={overBatchLimit ? "font-medium text-red-700" : "font-medium text-slate-700"}
                >
                  {files.length} file{files.length === 1 ? "" : "s"} selected, {formatBytes(totalSize)}{" "}
                  total
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={isBusy}
                  className="text-xs font-medium text-slate-500 underline hover:text-slate-700"
                >
                  Clear all
                </button>
              </div>
              <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between px-3 py-1.5 text-sm text-slate-600"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isBusy}
                      className="ml-2 shrink-0 text-xs text-slate-400 hover:text-red-600"
                      aria-label={`Remove ${file.name}`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-4">
        {isBusy && (
          <div className="space-y-2" aria-live="polite">
            <Progress value={status === "processing" ? undefined : progress} />
            <p className="text-sm text-slate-600">
              {status === "processing"
                ? "All files uploaded. Screening in progress, this can take a moment for larger batches."
                : `Uploading, ${announcedProgress}% complete.`}
            </p>
          </div>
        )}

        {status === "error" && errorMessage && (
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isBusy || files.length === 0 || overBatchLimit}
          className="w-full sm:w-auto"
        >
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isBusy ? "Screening..." : `Screen ${files.length || ""} image${files.length === 1 ? "" : "s"}`}
        </Button>
      </div>

      {result && (
        <div className="mt-8 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div>
                  <dt className="text-xs text-slate-500">Total</dt>
                  <dd className="text-lg font-semibold text-slate-900">{result.summary.total}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Succeeded</dt>
                  <dd className="text-lg font-semibold text-emerald-700">
                    {result.summary.succeeded}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Failed</dt>
                  <dd className="text-lg font-semibold text-red-700">{result.summary.failed}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Medium / high risk</dt>
                  <dd className="text-lg font-semibold text-amber-700">
                    {result.summary.medium_risk + result.summary.high_risk}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Low risk</dt>
                  <dd className="text-lg font-semibold text-slate-900">{result.summary.low_risk}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <BatchResultsTable results={result.results} />
        </div>
      )}
    </div>
  );
}
