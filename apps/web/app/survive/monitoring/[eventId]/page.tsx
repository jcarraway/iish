'use client';
import { useParams } from 'next/navigation';
import { SurveillanceEventDetailScreen } from '@oncovax/app';

export default function Page() {
  const { eventId } = useParams<{ eventId: string }>();
  return <SurveillanceEventDetailScreen eventId={eventId!} />;
}
