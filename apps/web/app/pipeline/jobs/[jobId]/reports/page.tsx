'use client';
import { useParams } from 'next/navigation';
import { PipelineReportsScreen } from '@iish/app';

export default function ReportsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <PipelineReportsScreen jobId={jobId} />;
}
