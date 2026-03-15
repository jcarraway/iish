'use client';

import { useState, useRef, useCallback } from 'react';
import { checkImageQuality, createThumbnail, convertHeicToJpeg } from '@/lib/image-quality';

export interface UploadedFile {
  s3Key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl: string;
}

interface FileInProgress {
  id: string;
  file: File;
  filename: string;
  progress: number;
  status: 'checking' | 'uploading' | 'done' | 'error';
  thumbnailUrl: string;
  error?: string;
  qualityWarnings?: string[];
  s3Key?: string;
  mimeType?: string;
}

interface Props {
  onUploadComplete: (files: UploadedFile[]) => void;
  maxFiles?: number;
}

export default function DocumentUploader({ onUploadComplete, maxFiles = 10 }: Props) {
  const [files, setFiles] = useState<FileInProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const updateFile = useCallback((id: string, updates: Partial<FileInProgress>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.thumbnailUrl) URL.revokeObjectURL(file.thumbnailUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const processFile = useCallback(async (rawFile: File) => {
    const id = crypto.randomUUID();
    let file = rawFile;

    // Convert HEIC if needed
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        file = await convertHeicToJpeg(file);
      } catch {
        setFiles((prev) => [...prev, {
          id, file, filename: rawFile.name, progress: 0,
          status: 'error', thumbnailUrl: '', error: 'Failed to convert HEIC image',
        }]);
        return;
      }
    }

    const thumbnailUrl = await createThumbnail(file).catch(() => '');

    const entry: FileInProgress = {
      id, file, filename: file.name, progress: 0,
      status: 'checking', thumbnailUrl,
    };
    setFiles((prev) => [...prev, entry]);

    // Quality check
    const quality = await checkImageQuality(file);
    if (quality.issues.length > 0 && file.size > 20 * 1024 * 1024) {
      updateFile(id, { status: 'error', error: quality.suggestions[0] });
      return;
    }
    if (quality.issues.length > 0) {
      updateFile(id, { qualityWarnings: quality.suggestions });
    }

    // Get presigned URL
    updateFile(id, { status: 'uploading', progress: 0 });
    try {
      const res = await fetch('/api/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || 'image/jpeg',
          fileSize: file.size,
        }),
      });
      if (!res.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, s3Key } = await res.json();

      // Upload to S3 via XMLHttpRequest for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type || 'image/jpeg');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            updateFile(id, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(file);
      });

      updateFile(id, {
        status: 'done',
        progress: 100,
        s3Key,
        mimeType: file.type || 'image/jpeg',
      });
    } catch (err) {
      updateFile(id, {
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  }, [updateFile]);

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const remaining = maxFiles - files.length;
    const toProcess = Array.from(fileList).slice(0, remaining);
    await Promise.all(toProcess.map(processFile));
  }, [files.length, maxFiles, processFile]);

  const completedFiles = files.filter((f) => f.status === 'done' && f.s3Key);
  const canContinue = completedFiles.length > 0;

  const handleContinue = () => {
    onUploadComplete(
      completedFiles.map((f) => ({
        s3Key: f.s3Key!,
        filename: f.filename,
        mimeType: f.mimeType ?? 'image/jpeg',
        fileSize: f.file.size,
        thumbnailUrl: f.thumbnailUrl,
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-blue-400 hover:bg-blue-50/50"
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFiles(e.dataTransfer.files); }}
      >
        <svg className="mb-3 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="mb-4 text-sm text-gray-600">
          Drag &amp; drop your documents here, or
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Take a photo
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Choose files
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          JPEG, PNG, PDF, or HEIC. Up to 20MB per file.
        </p>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.heic"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* File grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {files.map((f) => (
            <div key={f.id} className="relative rounded-lg border bg-white p-2">
              {/* Thumbnail */}
              <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded bg-gray-100">
                {f.thumbnailUrl ? (
                  <img src={f.thumbnailUrl} alt={f.filename} className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>

              {/* Filename */}
              <p className="truncate text-xs text-gray-600">{f.filename}</p>

              {/* Progress bar */}
              {f.status === 'uploading' && (
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}

              {/* Status indicators */}
              {f.status === 'checking' && (
                <p className="mt-1 text-xs text-gray-400">Checking...</p>
              )}
              {f.status === 'done' && (
                <p className="mt-1 text-xs text-green-600">Uploaded</p>
              )}
              {f.status === 'error' && (
                <p className="mt-1 text-xs text-red-600">{f.error}</p>
              )}

              {/* Quality warnings */}
              {f.qualityWarnings && f.qualityWarnings.length > 0 && (
                <p className="mt-1 text-xs text-amber-600">{f.qualityWarnings[0]}</p>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs text-white hover:bg-red-600"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Continue button */}
      <button
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Continue with {completedFiles.length} document{completedFiles.length !== 1 ? 's' : ''}
      </button>
    </div>
  );
}
