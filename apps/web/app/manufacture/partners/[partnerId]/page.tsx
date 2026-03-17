'use client';
import { useParams } from 'next/navigation';
import { ManufacturingPartnerDetailScreen } from '@oncovax/app';
export default function Page() {
  const { partnerId } = useParams<{ partnerId: string }>();
  return <ManufacturingPartnerDetailScreen partnerId={partnerId} />;
}
