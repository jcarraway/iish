import { useLocalSearchParams } from 'expo-router';
import { ManufacturingPartnerDetailScreen } from '@iish/app';

export default function ManufacturingPartnerDetailPage() {
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>();
  return <ManufacturingPartnerDetailScreen partnerId={partnerId!} />;
}
