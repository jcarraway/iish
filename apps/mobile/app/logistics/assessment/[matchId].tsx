import { useLocalSearchParams } from 'expo-router';
import { LogisticsAssessmentScreen } from '@oncovax/app';

export default function LogisticsAssessmentRoute() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  return <LogisticsAssessmentScreen matchId={matchId} />;
}
