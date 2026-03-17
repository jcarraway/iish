'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { RegulatoryRecommendationScreen } from '@oncovax/app';

function Content() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId') ?? '';
  return <RegulatoryRecommendationScreen assessmentId={assessmentId} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16"><p className="text-sm text-gray-600">Loading...</p></div>}>
      <Content />
    </Suspense>
  );
}
