'use client';

import { LearnArticleScreen } from '@iish/app';
import { VisualizationEmbed, getVisualizationsForArticle } from '@/components/visualizations';

export function LearnArticleClient({ slug, category }: { slug: string; category: string }) {
  const vizs = getVisualizationsForArticle(slug);

  const renderViz = vizs.length > 0
    ? (sectionIndex: number) => {
        const match = vizs.find(v => v.placement === `after-section-${sectionIndex}`);
        return match ? <VisualizationEmbed vizId={match.id} /> : null;
      }
    : undefined;

  return <LearnArticleScreen slug={slug} category={category} renderBetweenSections={renderViz} />;
}
