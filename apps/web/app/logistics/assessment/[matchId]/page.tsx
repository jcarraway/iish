'use client';

import { useParams } from 'next/navigation';
import { LogisticsAssessmentScreen } from '@iish/app';

export default function LogisticsAssessmentPage() {
  const params = useParams();
  const matchId = typeof params.matchId === 'string' ? params.matchId : '';
  return <LogisticsAssessmentScreen matchId={matchId} />;
}
