import { useLocalSearchParams } from 'expo-router';
import { PipelineReportsScreen } from '@oncovax/app';

export default function PipelineReportsPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineReportsScreen jobId={jobId!} />;
}
