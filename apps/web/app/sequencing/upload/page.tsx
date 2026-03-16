'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';

type UploadStep = 'select' | 'uploading' | 'extracting' | 'done';

const EXTRACT_MESSAGES = [
  'Reading your report...',
  'Extracting mutations...',
  'Analyzing biomarkers...',
  'Identifying therapy matches...',
];

export default function SequencingUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>('select');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractMessageIdx, setExtractMessageIdx] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const processFile = useCallback(async (file: File) => {
    setSelectedFile(file);
    setError(null);

    // Validate file type
    if (!file.type.match(/^(application\/pdf|image\/(jpeg|png|webp|heic))$/)) {
      setError('Please upload a PDF or image file (JPEG, PNG, WebP, HEIC)');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('File must be under 20MB');
      return;
    }

    try {
      // Step 1: Get presigned upload URL
      setStep('uploading');
      setUploadProgress(10);

      const urlRes = await fetch('/api/genomics/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });
      if (!urlRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, s3Key } = await urlRes.json();

      setUploadProgress(30);

      // Step 2: Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file');

      setUploadProgress(100);

      // Step 3: Extract genomic data
      setStep('extracting');
      const msgTimer = setInterval(() => {
        setExtractMessageIdx(prev => Math.min(prev + 1, EXTRACT_MESSAGES.length - 1));
      }, 5000);

      const extractRes = await fetch('/api/genomics/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Keys: [s3Key],
          mimeTypes: [file.type],
        }),
      });

      clearInterval(msgTimer);

      if (!extractRes.ok) throw new Error('Failed to extract genomic data');
      const { genomicResultId } = await extractRes.json();

      setStep('done');
      router.push(`/sequencing/confirm?resultId=${genomicResultId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('select');
    }
  }, [router]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  if (step === 'uploading') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Uploading your report</h1>
        <p className="mt-2 text-sm text-gray-500">{selectedFile?.name}</p>
        <div className="mt-8">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">{uploadProgress}% uploaded</p>
        </div>
      </div>
    );
  }

  if (step === 'extracting') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Analyzing your genomic report</h1>
        <p className="mt-2 text-sm text-gray-500">This usually takes 20-30 seconds.</p>
        <div className="mt-10 space-y-4">
          {EXTRACT_MESSAGES.map((msg, i) => {
            const isActive = i === extractMessageIdx;
            const isPast = i < extractMessageIdx;
            return (
              <div key={i} className="flex items-center gap-3">
                {isPast ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-200" />
                )}
                <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : isPast ? 'text-gray-500' : 'text-gray-400'}`}>
                  {msg}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/sequencing')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to sequencing
      </button>

      <h1 className="text-3xl font-bold text-gray-900">Upload Genomic Results</h1>
      <p className="mt-2 text-sm text-gray-500">
        Upload your genomic test report (PDF or photo) from Foundation Medicine, Tempus, Guardant, or any other provider.
      </p>

      <div
        className={`mt-8 cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFileSelect}
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="mt-4 font-medium text-gray-700">
          {dragOver ? 'Drop your file here' : 'Drag and drop your genomic report, or click to browse'}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Accepts PDF and image files up to 20MB
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Supported providers</h3>
        <p className="mt-1 text-sm text-gray-500">
          Foundation Medicine (FoundationOne CDx), Tempus (xT, xF), Guardant Health (Guardant360),
          Caris Life Sciences, NeoGenomics, and most other CGP reports.
        </p>
      </div>
    </div>
  );
}
