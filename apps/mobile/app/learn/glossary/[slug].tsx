import { useLocalSearchParams } from 'expo-router';
import { LearnGlossaryTermScreen } from '@oncovax/app';

export default function GlossaryTermPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <LearnGlossaryTermScreen slug={slug || ''} />;
}
