import { useLocalSearchParams } from 'expo-router';
import { PeerConnectionScreen } from '@iish/app';

export default function PeerConnectionPage() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  return <PeerConnectionScreen connectionId={connectionId!} />;
}
