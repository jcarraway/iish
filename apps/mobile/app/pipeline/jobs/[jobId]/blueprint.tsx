import { useLocalSearchParams } from 'expo-router';
import { PipelineBlueprintScreen } from '@iish/app';

export default function PipelineBlueprintPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineBlueprintScreen jobId={jobId!} />;
}
