import { useLocalSearchParams } from 'expo-router';
import { ManufacturingOrderDetailScreen } from '@iish/app';

export default function ManufacturingOrderDetailPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <ManufacturingOrderDetailScreen orderId={orderId!} />;
}
