'use client';
import { useParams } from 'next/navigation';
import { PeerFeedbackScreen } from '@iish/app';

export default function Page() {
  const { connectionId } = useParams<{ connectionId: string }>();
  return <PeerFeedbackScreen connectionId={connectionId!} />;
}
