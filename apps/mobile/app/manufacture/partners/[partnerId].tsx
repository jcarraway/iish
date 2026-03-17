import { useLocalSearchParams } from 'expo-router';
import { ManufacturingPartnerDetailScreen } from '@oncovax/app';

export default function ManufacturingPartnerDetailPage() {
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>();
  return <ManufacturingPartnerDetailScreen partnerId={partnerId!} />;
}
