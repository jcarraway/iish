import { useLocalSearchParams } from 'expo-router';
import { PipelineJobDetailScreen } from '@iish/app';

export default function PipelineJobDetailPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineJobDetailScreen jobId={jobId!} />;
}
