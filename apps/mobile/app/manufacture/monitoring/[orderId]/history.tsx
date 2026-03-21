import { useLocalSearchParams } from 'expo-router';
import { MonitoringHistoryScreen } from '@iish/app';

export default function MonitoringHistoryPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <MonitoringHistoryScreen orderId={orderId!} />;
}
