import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { LearnArticleClient } from './client';

export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, category: true },
  });
  return articles.map((a) => ({
    category: a.category,
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      metaTitle: true,
      metaDescription: true,
      title: true,
      publishedAt: true,
      structuredData: true,
    },
  });

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      siteName: 'OncoVax',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  // Fetch structured data for JSON-LD
  const article = await prisma.article.findUnique({
    where: { slug },
    select: {
      title: true,
      metaDescription: true,
      publishedAt: true,
      updatedAt: true,
      structuredData: true,
    },
  });

  const jsonLd = article?.structuredData || {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article?.title,
    description: article?.metaDescription,
    datePublished: article?.publishedAt?.toISOString(),
    dateModified: article?.updatedAt?.toISOString(),
    publisher: {
      '@type': 'Organization',
      name: 'OncoVax',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LearnArticleClient slug={slug} category={category} />
    </>
  );
}
