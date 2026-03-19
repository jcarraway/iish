'use client';

import { useParams } from 'next/navigation';
import { LearnGlossaryTermScreen } from '@oncovax/app';

export default function GlossaryTermPage() {
  const params = useParams();
  return <LearnGlossaryTermScreen slug={params.slug as string} />;
}
