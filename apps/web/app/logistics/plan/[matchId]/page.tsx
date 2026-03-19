'use client';

import { useParams } from 'next/navigation';
import { LogisticsPlanScreen } from '@oncovax/app';

export default function LogisticsPlanPage() {
  const params = useParams();
  const matchId = typeof params.matchId === 'string' ? params.matchId : '';
  return <LogisticsPlanScreen matchId={matchId} />;
}
