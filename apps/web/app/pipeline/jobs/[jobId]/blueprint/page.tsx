'use client';
import { useParams } from 'next/navigation';
import { PipelineBlueprintScreen } from '@oncovax/app';

export default function BlueprintPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <PipelineBlueprintScreen jobId={jobId} />;
}
