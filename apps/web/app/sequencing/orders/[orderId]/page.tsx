'use client';
import { useParams } from 'next/navigation';
import { SequencingOrderDetailScreen } from '@iish/app';

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  return <SequencingOrderDetailScreen orderId={orderId} />;
}
