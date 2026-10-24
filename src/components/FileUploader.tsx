"use client";

import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Accept;
  maxFiles?: number;
  maxSize?: number;
  label?: string;
  description?: string;
  multiple?: boolean;
}

export function FileUploader({
  onFilesSelected,
  accept,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024,
  label = "Drop your file here",
  description = "or click to browse",
  multiple = false,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-150 ${
        isDragActive
          ? "border-accent bg-accent/5 scale-[1.01]"
          : "border-border hover:border-accent hover:bg-accent/5"
      }`}
    >
      <input {...getInputProps()} />
      <Upload
        size={40}
        className={`mx-auto mb-4 ${
          isDragActive ? "text-accent" : "text-text-secondary"
        }`}
      />
      <p className="font-heading font-semibold text-lg uppercase mb-1">
        {isDragActive ? "Drop it here!" : label}
      </p>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
