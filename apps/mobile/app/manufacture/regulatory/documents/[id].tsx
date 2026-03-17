import { useLocalSearchParams } from 'expo-router';
import { RegulatoryDocumentDetailScreen } from '@oncovax/app';

export default function RegulatoryDocumentDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RegulatoryDocumentDetailScreen documentId={id!} />;
}
