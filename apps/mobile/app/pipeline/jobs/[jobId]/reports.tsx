import { useLocalSearchParams } from 'expo-router';
import { PipelineReportsScreen } from '@iish/app';

export default function PipelineReportsPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineReportsScreen jobId={jobId!} />;
}
