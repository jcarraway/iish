'use client';
import { useParams } from 'next/navigation';
import { MatchDetailScreen } from '@iish/app';
export default function Page() {
  const { trialId } = useParams<{ trialId: string }>();
  return <MatchDetailScreen trialId={trialId} />;
}
