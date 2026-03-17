import { useLocalSearchParams } from 'expo-router';
import { MatchDetailScreen } from '@oncovax/app';

export default function MatchDetailPage() {
  const { trialId } = useLocalSearchParams<{ trialId: string }>();
  return <MatchDetailScreen trialId={trialId!} />;
}
