'use client';
import { useParams } from 'next/navigation';
import { IntelItemDetailScreen } from '@iish/app';

export default function IntelItemPage() {
  const params = useParams();
  return <IntelItemDetailScreen id={params.id as string} />;
}
