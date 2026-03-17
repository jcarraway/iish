'use client';
import { useParams } from 'next/navigation';
import { PipelineJobDetailScreen } from '@oncovax/app';

export default function PipelineJobDetailPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <PipelineJobDetailScreen jobId={jobId} />;
}
