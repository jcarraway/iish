'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PathwayRecommendation from '@/components/PathwayRecommendation';
import type { RegulatoryDocumentType, RegulatoryPathwayType } from '@oncovax/shared';

interface Assessment {
  id: string;
  recommended: RegulatoryPathwayType;
  rationale: string;
  alternatives: { pathway: RegulatoryPathwayType; rationale: string }[];
  requiredDocuments: RegulatoryDocumentType[];
  estimatedCostMin: number;
  estimatedCostMax: number;
  estimatedTimelineWeeks: number;
}

export default function RecommendationPage() {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('pathwayAssessment');
    if (stored) {
      setAssessment(JSON.parse(stored));
    } else {
      router.push('/manufacture/regulatory/assessment');
    }
  }, [router]);

  async function handleGenerateDocument(docType: RegulatoryDocumentType) {
    if (!assessment) return;
    setGenerating(docType);

    try {
      const res = await fetch('/api/regulatory/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessmentId: assessment.id,
          documentType: docType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/manufacture/regulatory/documents/${data.document.id}`);
      }
    } catch {
      // Ignore
    } finally {
      setGenerating(null);
    }
  }

  if (!assessment) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading recommendation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture/regulatory" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Regulatory pathways
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Your Pathway Recommendation</h1>
      <p className="mt-2 text-sm text-gray-600">
        Based on your assessment, here is our recommended regulatory pathway and required documentation.
      </p>

      {generating && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-blue-700">Generating document with AI... This may take a moment.</p>
        </div>
      )}

      <div className="mt-8">
        <PathwayRecommendation
          {...assessment}
          assessmentId={assessment.id}
          onGenerateDocument={handleGenerateDocument}
        />
      </div>

      {/* Next Steps */}
      <div className="mt-8 rounded-lg border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900">Next Steps</h3>
        <ol className="mt-3 space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">1</span>
            Generate the required documents above (AI-drafted starting points)
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">2</span>
            Review all documents with your physician
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">3</span>
            <Link href="/manufacture/partners" className="text-blue-600 hover:text-blue-800">Select a manufacturing partner</Link>
          </li>
          <li className="flex gap-2">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">4</span>
            Submit documents through the appropriate regulatory channel
          </li>
        </ol>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/manufacture/regulatory/documents"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all your documents &rarr;
        </Link>
      </div>
    </div>
  );
}
