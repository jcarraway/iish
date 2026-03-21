'use client';

import { useParams } from 'next/navigation';
import { LearnCategoryScreen } from '@iish/app';

export default function LearnCategoryPage() {
  const params = useParams();
  return <LearnCategoryScreen category={params.category as string} />;
}
