import { useLocalSearchParams } from 'expo-router';
import { SequencingOrderDetailScreen } from '@oncovax/app';

export default function SequencingOrderDetailPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <SequencingOrderDetailScreen orderId={orderId!} />;
}
