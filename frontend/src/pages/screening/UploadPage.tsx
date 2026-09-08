import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import type { FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/lib/routes";
import { ImageDropzone } from "./components/ImageDropzone";
import { PatientLinkField } from "./components/PatientLinkField";
import { useUploadScan } from "./hooks/useUploadScan";

const formSchema = z.object({
  patientName: z.string().max(120, "Keep the name under 120 characters.").optional(),
});
type FormValues = z.infer<typeof formSchema>;

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [announcedProgress, setAnnouncedProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { patientName: "" },
  });

  const { mutateAsync } = useUploadScan();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFilesAccepted(files: File[]) {
    const nextFile = files[0];
    setFileError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setStatus("idle");
  }

  function handleFilesRejected(rejections: FileRejection[]) {
    const first = rejections[0];
    setFileError(
      `${first?.file.name ?? "That file"} was not accepted. Choose a JPEG, PNG, or WEBP image.`,
    );
  }

  function clearFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  }

  function handleProgress(percent: number) {
    setProgress(percent);
    setAnnouncedProgress((prev) => (percent - prev >= 10 || percent === 100 ? percent : prev));
    if (percent >= 100) setStatus("processing");
  }

  async function onSubmit(values: FormValues) {
    if (!file) {
      setFileError("Choose a fundus image before submitting.");
      return;
    }
    setStatus("uploading");
    setProgress(0);
    setAnnouncedProgress(0);
    setErrorMessage(null);

    try {
      const response = await mutateAsync({
        file,
        patientName: values.patientName,
        patientId,
        onProgress: handleProgress,
      });
      setStatus("success");
      toast.success("Screening submitted. Opening the result.");
      navigate(ROUTES.scanDetail(response.scan_id));
    } catch (error) {
      setStatus("error");
      const detail = axios.isAxiosError(error)
        ? (error.response?.data as { detail?: string } | undefined)?.detail
        : undefined;
      setErrorMessage(detail ?? "The upload failed. Check your connection and try again.");
    }
  }

  const isBusy = status === "uploading" || status === "processing";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">New screening</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a retinal fundus photograph to screen for diabetic retinopathy and cataract risk.
          This is a decision-support aid, not a diagnosis. Results should be reviewed by a
          clinician.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Fundus image</CardTitle>
            <CardDescription>JPEG, PNG, or WEBP. One image per screening.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file && (
              <ImageDropzone
                multiple={false}
                disabled={isBusy}
                onFilesAccepted={handleFilesAccepted}
                onFilesRejected={handleFilesRejected}
                helperText="JPEG, PNG, or WEBP. One file."
              />
            )}
            {file && previewUrl && (
              <div className="flex items-start gap-4">
                <img
                  src={previewUrl}
                  alt="Selected fundus photograph preview"
                  className="h-32 w-32 rounded-md border border-slate-200 object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={clearFile}
                    disabled={isBusy}
                  >
                    Choose a different image
                  </Button>
                </div>
              </div>
            )}
            {fileError && (
              <p role="alert" className="text-sm text-red-700">
                {fileError}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient (optional)</CardTitle>
            <CardDescription>
              Link this scan to a patient record, or leave it blank for an anonymous camp
              screening.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="patientName">Patient name</Label>
              <Input
                id="patientName"
                placeholder="e.g. Meena Kumari"
                disabled={isBusy}
                {...register("patientName")}
              />
              {errors.patientName && (
                <p role="alert" className="text-sm text-red-700">
                  {errors.patientName.message}
                </p>
              )}
            </div>
            <PatientLinkField value={patientId} onChange={setPatientId} disabled={isBusy} />
          </CardContent>
        </Card>

        {isBusy && (
          <div className="space-y-2" aria-live="polite">
            <Progress value={status === "processing" ? undefined : progress} />
            <p className="text-sm text-slate-600">
              {status === "processing"
                ? "Upload complete. Running the screening model, this takes a few seconds."
                : `Uploading, ${announcedProgress}% complete.`}
            </p>
          </div>
        )}

        {status === "error" && errorMessage && (
          <p role="alert" className="text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <Button type="submit" disabled={isBusy || !file} className="w-full sm:w-auto">
          {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isBusy ? "Uploading..." : "Submit screening"}
        </Button>
      </form>
    </div>
  );
}
