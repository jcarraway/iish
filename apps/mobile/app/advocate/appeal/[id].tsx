import { useLocalSearchParams } from 'expo-router';
import { AppealDetailScreen } from '@iish/app';

export default function AppealDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AppealDetailScreen id={id} />;
}
