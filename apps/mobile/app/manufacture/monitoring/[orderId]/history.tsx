import { useLocalSearchParams } from 'expo-router';
import { MonitoringHistoryScreen } from '@oncovax/app';

export default function MonitoringHistoryPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <MonitoringHistoryScreen orderId={orderId!} />;
}
