"use client";

import { FileTextIcon, Loader2Icon, UploadCloudIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RESUME } from "@/config/constants";
import { cn } from "@/lib/others/utils";
import { fileToBase64, useUploadResume } from "../hooks/useResume";

const MAX_SIZE_MB = RESUME.MAX_FILE_SIZE_BYTES / (1024 * 1024);

interface ResumeUploadZoneProps {
  variant?: "empty" | "replace";
}

export const ResumeUploadZone = ({
  variant = "empty",
}: ResumeUploadZoneProps) => {
  const uploadResume = useUploadResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(RESUME.ALLOWED_EXTENSION)) {
      toast.error("Only PDF files are accepted.");
      return;
    }

    if (file.size > RESUME.MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    try {
      const fileBase64 = await fileToBase64(file);
      uploadResume.mutate({ fileName: file.name, fileBase64 });
    } catch {
      toast.error("Could not read the selected file.");
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center transition-colors",
        variant === "empty" ? "p-10" : "p-6",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-background",
        uploadResume.isPending && "pointer-events-none opacity-60",
      )}
    >
      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
        {uploadResume.isPending ? (
          <Loader2Icon className="size-6 text-primary animate-spin" />
        ) : (
          <UploadCloudIcon className="size-6 text-primary" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {uploadResume.isPending
            ? "Scanning & uploading..."
            : variant === "empty"
              ? "Drag & drop your resume here"
              : "Drag & drop a new resume to replace it"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF only, up to {MAX_SIZE_MB}MB
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploadResume.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <FileTextIcon className="size-4" />
        Choose PDF
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
};
