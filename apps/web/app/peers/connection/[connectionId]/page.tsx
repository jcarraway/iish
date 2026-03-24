'use client';
import { useParams } from 'next/navigation';
import { PeerConnectionScreen } from '@iish/app';

export default function Page() {
  const { connectionId } = useParams<{ connectionId: string }>();
  return <PeerConnectionScreen connectionId={connectionId!} />;
}
