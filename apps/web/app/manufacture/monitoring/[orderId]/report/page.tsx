'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { MonitoringReportScreen } from '@iish/app';

function Content() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type') ?? undefined;
  return <MonitoringReportScreen orderId={orderId} reportTypeParam={reportType} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-6 py-16"><p className="text-sm text-gray-600">Loading...</p></div>}>
      <Content />
    </Suspense>
  );
}
