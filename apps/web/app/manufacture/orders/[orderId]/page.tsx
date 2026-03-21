'use client';
import { useParams } from 'next/navigation';
import { ManufacturingOrderDetailScreen } from '@iish/app';
export default function Page() {
  const { orderId } = useParams<{ orderId: string }>();
  return <ManufacturingOrderDetailScreen orderId={orderId} />;
}
