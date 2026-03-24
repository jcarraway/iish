import { View, Text } from 'dripsy';
import { Link } from 'solito/link';

export function HomeScreen() {
  return (
    <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$24', alignItems: 'center', alignSelf: 'center', width: '100%' }}>
      <Text sx={{ fontSize: '$5xl', fontWeight: '700', letterSpacing: -0.5, textAlign: 'center', color: '$foreground' }}>
        Find personalized cancer vaccine trials
      </Text>
      <Text sx={{ mt: '$6', fontSize: '$lg', color: '$mutedForeground', textAlign: 'center' }}>
        Upload your pathology report or connect MyChart. Our AI matches you to enrolling
        personalized cancer vaccine clinical trials in seconds.
      </Text>
      <View sx={{ mt: '$10', flexDirection: 'row', justifyContent: 'center', gap: '$4' }}>
        <Link href="/start">
          <View sx={{ borderRadius: '$lg', bg: '$primary', px: '$8', py: '$3' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '$primaryForeground' }}>
              Get Started
            </Text>
          </View>
        </Link>
        <Link href="/learn">
          <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: '$border', px: '$8', py: '$3' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '$foreground' }}>
              Learn More
            </Text>
          </View>
        </Link>
        <Link href="/prevent">
          <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: '$border', px: '$8', py: '$3' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '$foreground' }}>
              Prevention Trials
            </Text>
          </View>
        </Link>
        <Link href="/prevent/onboarding">
          <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: '#7C3AED', px: '$8', py: '$3' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: '#7C3AED' }}>
              Assess Your Risk
            </Text>
          </View>
        </Link>
      </View>
    </View>
  );
}
