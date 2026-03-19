import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oncovax.com';

export async function GET() {
  const [articles, glossaryTerms] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'published' },
      select: { slug: true, category: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.glossaryTerm.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { term: 'asc' },
    }),
  ]);

  const categories = [
    'diagnosis', 'biomarkers', 'treatment', 'testing',
    'decisions', 'side-effects', 'survivorship', 'innovation',
  ];

  const urls: string[] = [];

  // Learn hub
  urls.push(`
  <url>
    <loc>${BASE_URL}/learn</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);

  // Category pages
  for (const cat of categories) {
    urls.push(`
  <url>
    <loc>${BASE_URL}/learn/${cat}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Article pages
  for (const article of articles) {
    urls.push(`
  <url>
    <loc>${BASE_URL}/learn/${article.category}/${article.slug}</loc>
    <lastmod>${article.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }

  // Glossary hub
  urls.push(`
  <url>
    <loc>${BASE_URL}/learn/glossary</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);

  // Glossary term pages
  for (const term of glossaryTerms) {
    urls.push(`
  <url>
    <loc>${BASE_URL}/learn/glossary/${term.slug}</loc>
    <lastmod>${term.updatedAt.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
