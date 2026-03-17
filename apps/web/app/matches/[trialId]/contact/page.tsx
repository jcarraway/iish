'use client';
import { useParams } from 'next/navigation';
import { OncologistBriefScreen } from '@oncovax/app';
export default function Page() {
  const { trialId } = useParams<{ trialId: string }>();
  return <OncologistBriefScreen trialId={trialId} />;
}
