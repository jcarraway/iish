import { useLocalSearchParams } from 'expo-router';
import { LearnArticleScreen } from '@iish/app';

export default function LearnArticlePage() {
  const { category, slug } = useLocalSearchParams<{ category: string; slug: string }>();
  return <LearnArticleScreen slug={slug || ''} category={category} />;
}
