"use client";

import { useDropzone } from "react-dropzone";
import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_CONFIG } from "@/config/app.config";

export type Attachment = { file: File };

export function AttachmentDropzone({
  files,
  onFilesChange,
  disabled = false,
}: {
  files: Attachment[];
  onFilesChange: (next: Attachment[]) => void;
  disabled?: boolean;
}) {
  const cfg = APP_CONFIG.attachments;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    maxFiles: cfg.maxFiles,
    maxSize: cfg.maxFileSizeMB * 1024 * 1024,
    disabled,
    onDrop: (accepted) => {
      const merged = [...files, ...accepted.map((f) => ({ file: f }))].slice(0, cfg.maxFiles);
      onFilesChange(merged);
    },
  });

  return (
    <div className="flex h-full flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-center transition-colors",
          disabled
            ? "cursor-not-allowed border-muted bg-card/40 opacity-50"
            : isDragActive
              ? "border-primary bg-primary/10"
              : "border-primary/40 bg-card hover:border-primary hover:bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <FileText className={cn("h-6 w-6", disabled ? "text-muted-foreground" : "text-primary")} />
        <p className="text-sm font-medium">
          {isDragActive ? "Drop files…" : "Drag files or click to browse (optional)"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF, DOCX, XLSX, CSV · up to {cfg.maxFiles} files · {cfg.maxFileSizeMB}MB each
        </p>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((a, i) => (
            <li
              key={`${a.file.name}-${i}`}
              className="inline-flex items-center gap-2 rounded-md border border-primary/40 bg-card px-3 py-1.5 text-xs"
            >
              <FileText className="h-3 w-3 text-primary" />
              <span className="max-w-[180px] truncate">{a.file.name}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-accent"
                aria-label={`Remove ${a.file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
