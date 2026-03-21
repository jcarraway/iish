import { useLocalSearchParams } from 'expo-router';
import { MatchDetailScreen } from '@iish/app';

export default function MatchDetailPage() {
  const { trialId } = useLocalSearchParams<{ trialId: string }>();
  return <MatchDetailScreen trialId={trialId!} />;
}
