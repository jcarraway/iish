'use client';
import { useParams } from 'next/navigation';
import { NeoantigenExplorerScreen } from '@oncovax/app';

export default function NeoantigenExplorerPage() {
  const { jobId } = useParams<{ jobId: string }>();
  return <NeoantigenExplorerScreen jobId={jobId} />;
}
