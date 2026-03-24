import { useLocalSearchParams } from 'expo-router';
import { PeerMessagesScreen } from '@iish/app';

export default function PeerMessagesPage() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  return <PeerMessagesScreen connectionId={connectionId!} />;
}
