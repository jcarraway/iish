import { useLocalSearchParams } from 'expo-router';
import { LearnSearchScreen } from '@iish/app';

export default function LearnSearchPage() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return <LearnSearchScreen query={q || ''} />;
}
