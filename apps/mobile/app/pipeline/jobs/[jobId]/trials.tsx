import { useLocalSearchParams } from 'expo-router';
import { PipelineTrialsScreen } from '@oncovax/app';

export default function PipelineTrialsPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineTrialsScreen jobId={jobId!} />;
}
