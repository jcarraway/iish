'use client';
import { useParams } from 'next/navigation';
import { MonitoringHistoryScreen } from '@oncovax/app';
export default function Page() {
  const { orderId } = useParams<{ orderId: string }>();
  return <MonitoringHistoryScreen orderId={orderId} />;
}
