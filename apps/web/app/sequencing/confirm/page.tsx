'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GenomicConfirmScreen } from '@oncovax/app';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get('resultId');
  return <GenomicConfirmScreen resultId={resultId} />;
}

export default function SequencingConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  );
}
