import { View, Text, Pressable, ScrollView } from 'dripsy';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const SECTIONS = [
  { label: 'Dashboard', route: '/dashboard', icon: 'bar-chart-outline' as const },
  { label: 'Get Started', route: '/start', icon: 'rocket-outline' as const },
  { label: 'Learn', route: '/learn', icon: 'book-outline' as const },
  { label: 'Financial Aid', route: '/financial', icon: 'cash-outline' as const },
  { label: 'Manufacturing', route: '/manufacture', icon: 'construct-outline' as const },
  { label: 'Translate', route: '/translate', icon: 'language-outline' as const },
  { label: 'Survivorship', route: '/survive', icon: 'heart-outline' as const },
  { label: 'Fertility', route: '/fertility', icon: 'flower-outline' as const },
  { label: 'Insurance', route: '/advocate', icon: 'shield-checkmark-outline' as const },
  { label: 'Logistics', route: '/logistics', icon: 'airplane-outline' as const },
  { label: 'Second Opinion', route: '/second-opinion', icon: 'people-outline' as const },
  { label: 'Palliative Care', route: '/palliative', icon: 'heart-half-outline' as const },
  { label: 'Research', route: '/intel', icon: 'newspaper-outline' as const },
  { label: 'Prevention & Risk', route: '/prevent', icon: 'medkit-outline' as const },
  { label: 'Peer Support', route: '/peers', icon: 'people-outline' as const },
  { label: 'Records', route: '/dashboard/records', icon: 'document-text-outline' as const },
] as const;

export default function MoreScreen() {
  const router = useRouter();

  return (
    <ScrollView sx={{ flex: 1, bg: 'background' }}>
      <View sx={{ p: '$5', gap: '$3' }}>
        <Text sx={{ fontSize: 24, fontWeight: 'bold', color: 'text', mb: '$2' }}>
          More
        </Text>
        {SECTIONS.map(({ label, route, icon }) => (
          <Pressable
            key={route}
            onPress={() => router.push(route as any)}
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              bg: 'surface',
              p: '$4',
              borderRadius: 12,
              gap: '$3',
            }}
          >
            <Ionicons name={icon} size={24} color="#7C3AED" />
            <Text sx={{ fontSize: 16, fontWeight: '600', color: 'text' }}>
              {label}
            </Text>
            <View sx={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
