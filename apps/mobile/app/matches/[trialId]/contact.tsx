import { useLocalSearchParams } from 'expo-router';
import { OncologistBriefScreen } from '@oncovax/app';

export default function OncologistBriefPage() {
  const { trialId } = useLocalSearchParams<{ trialId: string }>();
  return <OncologistBriefScreen trialId={trialId!} />;
}
