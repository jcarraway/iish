'use client';
import { useParams } from 'next/navigation';
import { AdministrationSiteDetailScreen } from '@iish/app';
export default function Page() {
  const { siteId } = useParams<{ siteId: string }>();
  return <AdministrationSiteDetailScreen siteId={siteId} />;
}
