import { useLocalSearchParams } from 'expo-router';
import { OrderTrackingScreen } from '@oncovax/app';

export default function OrderTrackingPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <OrderTrackingScreen orderId={orderId!} />;
}
