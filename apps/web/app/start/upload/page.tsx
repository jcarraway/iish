'use client';

import { useRouter } from 'next/navigation';
import DocumentUploader from '@/components/DocumentUploader';
import type { UploadedFile } from '@/components/DocumentUploader';

export default function UploadPage() {
  const router = useRouter();

  const handleUploadComplete = (files: UploadedFile[]) => {
    sessionStorage.setItem('iish_uploaded_files', JSON.stringify(files));
    router.push('/start/confirm?path=upload');
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Upload your documents</h1>
      <p className="mt-2 mb-8 text-sm text-gray-500">
        Upload photos or PDFs of your pathology report, lab results, or treatment summary.
        Our AI will extract the relevant clinical details.
      </p>
      <DocumentUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
}
