import { useLocalSearchParams } from 'expo-router';
import { MonitoringReportScreen } from '@oncovax/app';

export default function MonitoringReportPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <MonitoringReportScreen orderId={orderId!} />;
}
