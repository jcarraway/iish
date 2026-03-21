import { useLocalSearchParams } from 'expo-router';
import { OncologistBriefScreen } from '@iish/app';

export default function OncologistBriefPage() {
  const { trialId } = useLocalSearchParams<{ trialId: string }>();
  return <OncologistBriefScreen trialId={trialId!} />;
}
