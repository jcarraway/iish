'use client';
import { useParams } from 'next/navigation';
import { PipelineTrialsScreen } from '@oncovax/app';

export default function TrialsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <PipelineTrialsScreen jobId={jobId} />;
}
