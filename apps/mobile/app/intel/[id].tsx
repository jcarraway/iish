import { useLocalSearchParams } from 'expo-router';
import { IntelItemDetailScreen } from '@oncovax/app';

export default function IntelItemRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <IntelItemDetailScreen id={id!} />;
}
