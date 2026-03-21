import { useLocalSearchParams } from 'expo-router';
import { SurveillanceEventDetailScreen } from '@iish/app';

export default function SurveillanceEventDetailPage() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return <SurveillanceEventDetailScreen eventId={eventId!} />;
}
