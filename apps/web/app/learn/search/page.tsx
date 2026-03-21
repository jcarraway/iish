'use client';

import { useSearchParams } from 'next/navigation';
import { LearnSearchScreen } from '@iish/app';

export default function LearnSearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  return <LearnSearchScreen query={query} />;
}
