'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConfirmProfileScreen } from '@iish/app';

function ConfirmPageInner() {
  const searchParams = useSearchParams();
  const path = searchParams.get('path') ?? 'upload';
  return <ConfirmProfileScreen path={path} />;
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem 1.5rem' }}><p style={{ color: '#6B7280' }}>Loading...</p></div>}>
      <ConfirmPageInner />
    </Suspense>
  );
}
