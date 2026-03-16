'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UploadFile {
  file: File;
  s3Key: string | null;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const ACCEPTED_EXTENSIONS = ['.fastq', '.fastq.gz', '.fq', '.fq.gz', '.bam'];

function getFileType(name: string): 'fastq' | 'fastq_gz' | 'bam' {
  if (name.endsWith('.bam')) return 'bam';
  if (name.endsWith('.gz')) return 'fastq_gz';
  return 'fastq';
}

function getInputFormat(name: string): 'fastq' | 'bam' {
  return name.endsWith('.bam') ? 'bam' : 'fastq';
}

export default function PipelineUploadPage() {
  const router = useRouter();
  const [tumorFiles, setTumorFiles] = useState<UploadFile[]>([]);
  const [normalFiles, setNormalFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tumorInputRef = useRef<HTMLInputElement>(null);
  const normalInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList, type: 'tumor' | 'normal') => {
    const newFiles = Array.from(files)
      .filter((f) => ACCEPTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)))
      .map((f) => ({ file: f, s3Key: null, progress: 0, status: 'pending' as const }));

    if (type === 'tumor') setTumorFiles((prev) => [...prev, ...newFiles]);
    else setNormalFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const uploadFile = async (uf: UploadFile, sampleType: 'tumor' | 'normal'): Promise<string> => {
    const res = await fetch('/api/pipeline/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: uf.file.name,
        fileSize: uf.file.size,
        fileType: getFileType(uf.file.name),
        sampleType,
      }),
    });

    if (!res.ok) throw new Error('Failed to get upload URL');
    const { uploadUrl, s3Key } = await res.json();

    // Upload via XHR for progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          const setter = sampleType === 'tumor' ? setTumorFiles : setNormalFiles;
          setter((prev) =>
            prev.map((f) => (f.file === uf.file ? { ...f, progress: pct, status: 'uploading' } : f))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(uf.file);
    });

    const setter = sampleType === 'tumor' ? setTumorFiles : setNormalFiles;
    setter((prev) =>
      prev.map((f) => (f.file === uf.file ? { ...f, s3Key, progress: 100, status: 'complete' } : f))
    );

    return s3Key;
  };

  const handleSubmit = async () => {
    if (tumorFiles.length === 0 || normalFiles.length === 0) {
      setError('Please upload both tumor and normal files.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Upload all files
      const tumorKeys = await Promise.all(tumorFiles.map((f) => uploadFile(f, 'tumor')));
      const normalKeys = await Promise.all(normalFiles.map((f) => uploadFile(f, 'normal')));

      // Submit pipeline job
      const res = await fetch('/api/pipeline/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tumorDataPath: tumorKeys[0],
          normalDataPath: normalKeys[0],
          inputFormat: getInputFormat(tumorFiles[0].file.name),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit pipeline job');
      }

      const { jobId } = await res.json();
      router.push(`/pipeline/jobs/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setSubmitting(false);
    }
  };

  const removeFile = (file: File, type: 'tumor' | 'normal') => {
    const setter = type === 'tumor' ? setTumorFiles : setNormalFiles;
    setter((prev) => prev.filter((f) => f.file !== file));
  };

  const DropZone = ({
    label,
    files,
    type,
    inputRef,
  }: {
    label: string;
    files: UploadFile[];
    type: 'tumor' | 'normal';
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => (
    <div
      className="rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-purple-400 transition-colors cursor-pointer"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files, type);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple
        accept=".fastq,.fastq.gz,.fq,.fq.gz,.bam"
        onChange={(e) => e.target.files && handleFiles(e.target.files, type)}
      />
      <div className="text-center">
        <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-lg ${type === 'tumor' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="mt-2 font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">.fastq, .fastq.gz, or .bam</p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2" onClick={(e) => e.stopPropagation()}>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
              <span className="flex-1 truncate text-sm text-gray-700">{f.file.name}</span>
              <span className="text-xs text-gray-400">{(f.file.size / 1024 / 1024).toFixed(0)}MB</span>
              {f.status === 'uploading' && (
                <div className="h-1.5 w-16 rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-purple-500 transition-all" style={{ width: `${f.progress}%` }} />
                </div>
              )}
              {f.status === 'complete' && (
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {f.status === 'pending' && (
                <button
                  onClick={() => removeFile(f.file, type)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Upload Sequencing Data</h1>
      <p className="mt-2 text-gray-600">
        Upload matched tumor and normal sequencing files to start the neoantigen prediction pipeline.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <DropZone label="Tumor Sample" files={tumorFiles} type="tumor" inputRef={tumorInputRef} />
        <DropZone label="Normal Sample" files={normalFiles} type="normal" inputRef={normalInputRef} />
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Files are encrypted at rest (AES-256) and in transit (TLS).
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting || tumorFiles.length === 0 || normalFiles.length === 0}
          className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Uploading & Submitting...' : 'Start Analysis'}
        </button>
      </div>
    </div>
  );
}
