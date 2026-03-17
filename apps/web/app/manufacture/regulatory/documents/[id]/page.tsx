'use client';
import { useParams } from 'next/navigation';
import { RegulatoryDocumentDetailScreen } from '@oncovax/app';
export default function Page() {
  const { id } = useParams<{ id: string }>();
  return <RegulatoryDocumentDetailScreen documentId={id} />;
}
