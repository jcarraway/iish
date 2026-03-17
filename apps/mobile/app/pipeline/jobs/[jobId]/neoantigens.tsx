import { useLocalSearchParams } from 'expo-router';
import { NeoantigenExplorerScreen } from '@oncovax/app';

export default function NeoantigenExplorerPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <NeoantigenExplorerScreen jobId={jobId!} />;
}
