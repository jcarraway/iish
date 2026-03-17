'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MyChartScreen } from '@oncovax/app';

function MyChartPageInner() {
  const searchParams = useSearchParams();
  return (
    <MyChartScreen
      connected={searchParams.get('connected') ?? undefined}
      connectionId={searchParams.get('connectionId') ?? undefined}
      error={searchParams.get('error') ?? undefined}
    />
  );
}

export default function MyChartPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem 1.5rem' }}><p style={{ color: '#6B7280' }}>Loading...</p></div>}>
      <MyChartPageInner />
    </Suspense>
  );
}
