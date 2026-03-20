import { useLocalSearchParams } from 'expo-router';
import { IntelSubtypeLandscapeScreen } from '@oncovax/app';

export default function IntelSubtypeLandscapeRoute() {
  const { subtype } = useLocalSearchParams<{ subtype: string }>();
  return <IntelSubtypeLandscapeScreen subtype={subtype} />;
}
