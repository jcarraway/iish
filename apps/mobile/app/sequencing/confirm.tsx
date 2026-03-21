import { useLocalSearchParams } from 'expo-router';
import { GenomicConfirmScreen } from '@iish/app';

export default function GenomicConfirmPage() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  return <GenomicConfirmScreen resultId={resultId ?? null} />;
}
