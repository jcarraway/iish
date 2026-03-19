import { useLocalSearchParams } from 'expo-router';
import { LogisticsPlanScreen } from '@oncovax/app';

export default function LogisticsPlanRoute() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <LogisticsPlanScreen matchId={matchId} />;
}
