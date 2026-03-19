import { useLocalSearchParams } from 'expo-router';
import { LearnArticleScreen } from '@oncovax/app';

export default function LearnArticlePage() {
  const { category, slug } = useLocalSearchParams<{ category: string; slug: string }>();
  return <LearnArticleScreen slug={slug || ''} category={category} />;
}
