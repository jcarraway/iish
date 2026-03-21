import { useLocalSearchParams } from 'expo-router';
import { PipelineTrialsScreen } from '@iish/app';

export default function PipelineTrialsPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return <PipelineTrialsScreen jobId={jobId!} />;
}
