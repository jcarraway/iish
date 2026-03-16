'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegulatoryDocumentCard from '@/components/RegulatoryDocumentCard';

interface Document {
  id: string;
  documentType: string;
  title: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  assessment: {
    id: string;
    recommendedPathway: string | null;
  };
}

export default function DocumentsListPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/regulatory/documents');
        if (res.status === 401) {
          router.push('/auth');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function handleUpdateStatus(docId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/regulatory/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setDocuments(prev =>
          prev.map(d => d.id === docId ? { ...d, status: data.document.status, reviewedAt: data.document.reviewedAt, reviewedBy: data.document.reviewedBy } : d)
        );
      }
    } catch {
      // Ignore
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture/regulatory" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Regulatory pathways
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Regulatory Documents</h1>
      <p className="mt-2 text-sm text-gray-600">
        Track the status of your AI-generated regulatory documents. All documents require
        physician review before submission.
      </p>

      {documents.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No documents generated yet.</p>
          <Link
            href="/manufacture/regulatory/assessment"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start pathway assessment
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {documents.map(doc => (
            <RegulatoryDocumentCard
              key={doc.id}
              {...doc}
              onView={(id) => router.push(`/manufacture/regulatory/documents/${id}`)}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}

      {/* Status Legend */}
      {documents.length > 0 && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700">Document Workflow</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded bg-gray-100 px-2 py-1 text-gray-600">Draft</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="rounded bg-blue-100 px-2 py-1 text-blue-700">Physician Reviewed</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Patient Signed</span>
            <span className="text-gray-400">&rarr;</span>
            <span className="rounded bg-green-100 px-2 py-1 text-green-700">Submitted</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            No document can be submitted without physician review. This is a safety requirement.
          </p>
        </div>
      )}
    </div>
  );
}
