import { useLocalSearchParams } from 'expo-router';
import { OrderTrackingScreen } from '@iish/app';

export default function OrderTrackingPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <OrderTrackingScreen orderId={orderId!} />;
}
