'use client';
import { useParams } from 'next/navigation';
import { PeerMessagesScreen } from '@iish/app';

export default function Page() {
  const { connectionId } = useParams<{ connectionId: string }>();
  return <PeerMessagesScreen connectionId={connectionId!} />;
}
