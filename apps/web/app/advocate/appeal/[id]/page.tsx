'use client';

import { useParams } from 'next/navigation';
import { AppealDetailScreen } from '@iish/app';

export default function AppealDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  return <AppealDetailScreen id={id} />;
}
