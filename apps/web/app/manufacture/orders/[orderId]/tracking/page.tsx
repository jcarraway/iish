'use client';
import { useParams } from 'next/navigation';
import { OrderTrackingScreen } from '@oncovax/app';
export default function Page() {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderTrackingScreen orderId={orderId} />;
}
