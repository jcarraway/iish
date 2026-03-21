import { useLocalSearchParams } from 'expo-router';
import { NeoantigenExplorerScreen } from '@iish/app';

export default function NeoantigenExplorerPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <NeoantigenExplorerScreen jobId={jobId!} />;
}
