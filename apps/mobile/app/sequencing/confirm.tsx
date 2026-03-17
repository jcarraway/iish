import { useLocalSearchParams } from 'expo-router';
import { GenomicConfirmScreen } from '@oncovax/app';

export default function GenomicConfirmPage() {
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  return <GenomicConfirmScreen resultId={resultId ?? null} />;
}
