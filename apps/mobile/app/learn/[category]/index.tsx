import { useLocalSearchParams } from 'expo-router';
import { LearnCategoryScreen } from '@oncovax/app';

export default function LearnCategoryPage() {
  const { category } = useLocalSearchParams<{ category: string }>();
  return <LearnCategoryScreen category={category || ''} />;
}
