'use client';

import { LearnArticleScreen } from '@oncovax/app';

export function LearnArticleClient({ slug, category }: { slug: string; category: string }) {
  return <LearnArticleScreen slug={slug} category={category} />;
}
