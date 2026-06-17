"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, FileText, RefreshCw, Plus } from "lucide-react";

interface DragDropUploaderProps {
  label: string;
  accept: string;
  value: string | string[];
  onChange: (value: any) => void;
  multiple?: boolean;
  maxSizeMB?: number;
  compressMaxWidth?: number;
  uploadType?: string;
}

// Client-side image compression helper
function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas toBlob failed"));
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function DragDropUploader({
  label,
  accept,
  value,
  onChange,
  multiple = false,
  maxSizeMB = 5,
  compressMaxWidth = 1200,
  uploadType,
}: DragDropUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif") {
      alert("HEIC/HEIF images are not natively supported by web browsers. Please convert your image to JPG, PNG, or WebP before uploading.");
      return null;
    }

    if (accept === "application/pdf") {
      const isPdf = file.type === "application/pdf" || ext === "pdf";
      if (!isPdf) {
        alert("Only PDF files (.pdf) are allowed for this upload.");
        return null;
      }
    }

    if (accept.includes("image")) {
      const allowedExts = ["jpeg", "png", "jpg", "webp"];
      const isAllowed = allowedExts.includes(ext || "") || (file.type && (
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/webp"
      ));
      if (!isAllowed) {
        alert("Only jpeg, png, jpg, and webp images are allowed.");
        return null;
      }
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File "${file.name}" is too large. Max size is ${maxSizeMB}MB.`);
      return null;
    }

    let fileToUpload: File = file;

    // Compress if it is an image
    if (file.type.startsWith("image/")) {
      try {
        const compressedBlob = await compressImage(file, compressMaxWidth, compressMaxWidth, 0.82);
        fileToUpload = new File(
          [compressedBlob],
          file.name.replace(/\.[^/.]+$/, "") + ".webp",
          { type: "image/webp" }
        );
      } catch (err) {
        console.error("Image compression failed, using original file:", err);
      }
    }

    const fd = new FormData();
    fd.append("file", fileToUpload);
    if (uploadType) {
      fd.append("type", uploadType);
    }

    try {
      const res = await fetch("/api/cv/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json() as { url?: string; error?: string };
      if (json.url) {
        return json.url;
      } else {
        alert(json.error || "Upload failed");
        return null;
      }
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to upload file");
      return null;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploading(true);
      if (multiple) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          if (url) uploadedUrls.push(url);
        }
        const currentUrls = Array.isArray(value) ? value : [];
        onChange([...currentUrls, ...uploadedUrls]);
      } else {
        const url = await uploadFile(files[0]);
        if (url) onChange(url);
      }
      setUploading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploading(true);
      if (multiple) {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          if (url) uploadedUrls.push(url);
        }
        const currentUrls = Array.isArray(value) ? value : [];
        onChange([...currentUrls, ...uploadedUrls]);
      } else {
        const url = await uploadFile(files[0]);
        if (url) onChange(url);
      }
      setUploading(false);
    }
  };

  const removeFile = async (indexToRemove?: number) => {
    let urlToRemove = "";
    if (multiple && typeof indexToRemove === "number") {
      const currentUrls = Array.isArray(value) ? value : [];
      urlToRemove = currentUrls[indexToRemove];
      onChange(currentUrls.filter((_, i) => i !== indexToRemove));
    } else {
      urlToRemove = Array.isArray(value) ? value[0] : value;
      onChange("");
    }

    if (urlToRemove) {
      try {
        const res = await fetch("/api/cv/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlToRemove }),
        });
        if (!res.ok) {
          const json = await res.json() as any;
          console.error("Failed to delete file from R2:", json.error || res.statusText);
        }
      } catch (err) {
        console.error("Failed to delete file from R2:", err);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const urls = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] tracking-[1.5px] uppercase text-muted block mb-1">
        {label}
      </label>

      {/* Grid of existing files (multiple mode) */}
      {multiple && urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          {urls.map((url, i) => (
            <div
              key={i}
              className="relative group aspect-video rounded border border-rule overflow-hidden bg-surface flex items-center justify-center"
            >
              <img src={url} alt="work upload" className="object-cover w-full h-full" />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 rounded"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Upload Box */}
      {(!multiple && urls.length > 0) ? (
        // Single File Preview
        <div className="relative border border-rule bg-surface p-4 rounded flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {accept.includes("image") ? (
              <div className="w-12 h-12 rounded border border-rule overflow-hidden shrink-0 bg-bg">
                <img src={urls[0]} alt="upload preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded border border-rule flex items-center justify-center shrink-0 bg-bg text-accent">
                <FileText size={20} />
              </div>
            )}
            <div className="overflow-hidden">
              <p className="text-xs text-ink truncate font-medium">
                {urls[0].split("/").pop() || "Uploaded File"}
              </p>
              <a
                href={urls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-accent hover:underline"
              >
                View File
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile()}
            className="p-2 border border-rule hover:border-red-500 rounded text-muted hover:text-red-500 transition-colors shrink-0"
            title="Delete File"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        // Dropzone area
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`relative border-2 border-dashed rounded p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-accent bg-accent/[0.02] scale-[0.99]"
              : "border-rule hover:border-ink hover:bg-tag-bg/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <>
                <RefreshCw size={18} className="text-accent animate-spin" />
                <p className="font-mono text-[11px] text-ink animate-pulse uppercase tracking-wider">
                  uploading.file...
                </p>
              </>
            ) : (
              <>
                <Upload size={18} className="text-muted" />
                <p className="font-mono text-[11px] text-ink uppercase tracking-wider">
                  {multiple ? "Drag & drop project screenshots" : `Drag & drop ${accept.includes("pdf") ? "pdf document" : "image file"}`}
                </p>
                <p className="font-mono text-[9px] text-muted">
                  [ or click to select ]
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
