'use client';
import { useParams } from 'next/navigation';
import { AdministrationSiteDetailScreen } from '@oncovax/app';
export default function Page() {
  const { siteId } = useParams<{ siteId: string }>();
  return <AdministrationSiteDetailScreen siteId={siteId} />;
}
