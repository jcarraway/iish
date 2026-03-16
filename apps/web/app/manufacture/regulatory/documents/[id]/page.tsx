'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DocumentDetail {
  id: string;
  documentType: string;
  title: string;
  content: string;
  status: string;
  templateVersion: string;
  modelUsed: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  pdfPath: string | null;
  createdAt: string;
  assessment: {
    id: string;
    recommendedPathway: string | null;
    cancerType: string | null;
    physicianName: string | null;
  };
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  physician_reviewed: { label: 'Physician Reviewed', className: 'bg-blue-100 text-blue-700' },
  patient_signed: { label: 'Patient Signed', className: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', className: 'bg-green-100 text-green-700' },
};

const STATUS_ACTIONS: Record<string, { label: string; next: string; confirm: string }> = {
  draft: { label: 'Mark as Physician Reviewed', next: 'physician_reviewed', confirm: 'Has a physician reviewed this document?' },
  physician_reviewed: { label: 'Mark as Patient Signed', next: 'patient_signed', confirm: 'Has the patient signed this document?' },
  patient_signed: { label: 'Mark as Submitted', next: 'submitted', confirm: 'Has this document been submitted to the relevant authority?' },
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/regulatory/documents/${params.id}`);
        if (res.status === 401) {
          router.push('/auth');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setDoc(data.document);
          setReviewNotes(data.document.reviewNotes ?? '');
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  async function handleStatusUpdate() {
    if (!doc) return;
    const action = STATUS_ACTIONS[doc.status];
    if (!action) return;

    if (!confirm(action.confirm)) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/regulatory/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action.next,
          reviewNotes: reviewNotes || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDoc(prev => prev ? { ...prev, ...data.document } : null);
      }
    } catch {
      // Ignore
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-gray-500">Document not found.</p>
        <Link href="/manufacture/regulatory/documents" className="mt-2 inline-block text-sm text-blue-600">
          &larr; Back to documents
        </Link>
      </div>
    );
  }

  const badge = STATUS_BADGE[doc.status] ?? STATUS_BADGE.draft;
  const action = STATUS_ACTIONS[doc.status];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture/regulatory/documents" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; All documents
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge.className}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-500">
              Created {new Date(doc.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        {doc.modelUsed && <span>Model: {doc.modelUsed}</span>}
        <span>Version: {doc.templateVersion}</span>
        {doc.assessment.cancerType && <span>Cancer: {doc.assessment.cancerType}</span>}
        {doc.assessment.physicianName && <span>Physician: {doc.assessment.physicianName}</span>}
      </div>

      {/* Document Content */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
          {doc.content}
        </pre>
      </div>

      {/* Review Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Review Notes</label>
        <textarea
          value={reviewNotes}
          onChange={e => setReviewNotes(e.target.value)}
          placeholder="Add notes from physician review, corrections, or comments..."
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {/* Status Actions */}
      {action && (
        <div className="mt-4">
          <button
            onClick={handleStatusUpdate}
            disabled={updating}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updating ? 'Updating...' : action.label}
          </button>
        </div>
      )}

      {/* Review Info */}
      {doc.reviewedAt && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Reviewed {new Date(doc.reviewedAt).toLocaleDateString()}
            {doc.reviewedBy && ` by ${doc.reviewedBy}`}
          </p>
        </div>
      )}
    </div>
  );
}
