import { useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageDropzoneProps {
  multiple?: boolean;
  disabled?: boolean;
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (rejections: FileRejection[]) => void;
  helperText?: string;
}

// Accessible drag-and-drop file input: the whole surface is keyboard-focusable and Enter/Space
// opens the file dialog (react-dropzone's default), and there's also an explicit "Browse files"
// button for a visible, unambiguous click target. Image-type filtering happens here via `accept`,
// which is the client-side check the work order asks for; a renamed non-image file that the
// browser still reports as an image/* type will pass this and correctly fail server-side instead,
// surfacing as a per-file error (that's what the batch self-test's "renamed .txt" case exercises).
export function ImageDropzone({
  multiple = false,
  disabled = false,
  onFilesAccepted,
  onFilesRejected,
  helperText,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (accepted.length > 0) onFilesAccepted(accepted);
      if (rejected.length > 0) onFilesRejected?.(rejected);
    },
    [onFilesAccepted, onFilesRejected],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple,
    disabled,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
        isDragActive ? "border-slate-500 bg-slate-50" : "border-slate-300"
      } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-slate-400"}`}
    >
      <input
        {...getInputProps()}
        aria-label={multiple ? "Upload fundus images" : "Upload fundus image"}
      />
      {multiple ? (
        <UploadCloud className="h-8 w-8 text-slate-400" />
      ) : (
        <ImageIcon className="h-8 w-8 text-slate-400" />
      )}
      <div>
        <p className="text-sm font-medium text-slate-700">
          {isDragActive
            ? `Drop the image${multiple ? "s" : ""} here`
            : `Drag and drop ${multiple ? "images" : "an image"}, or`}
        </p>
        {!isDragActive && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              open();
            }}
          >
            Browse files
          </Button>
        )}
      </div>
      {helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
}
