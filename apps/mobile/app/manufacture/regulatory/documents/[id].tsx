import { useLocalSearchParams } from 'expo-router';
import { RegulatoryDocumentDetailScreen } from '@iish/app';

export default function RegulatoryDocumentDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <RegulatoryDocumentDetailScreen documentId={id!} />;
}
