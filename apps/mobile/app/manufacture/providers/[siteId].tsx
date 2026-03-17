import { useLocalSearchParams } from 'expo-router';
import { AdministrationSiteDetailScreen } from '@oncovax/app';

export default function AdministrationSiteDetailPage() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  return <AdministrationSiteDetailScreen siteId={siteId!} />;
}
