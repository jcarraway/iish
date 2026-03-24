import { useLocalSearchParams } from 'expo-router';
import { PeerFeedbackScreen } from '@iish/app';

export default function PeerFeedbackPage() {
  const { connectionId } = useLocalSearchParams<{ connectionId: string }>();
  return <PeerFeedbackScreen connectionId={connectionId!} />;
}
