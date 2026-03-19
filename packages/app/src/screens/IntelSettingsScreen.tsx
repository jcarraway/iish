import { View, Text, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

export function IntelSettingsScreen() {
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$10', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Research Settings
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Configure your research intelligence preferences.
        </Text>

        <View sx={{ mt: '$8', p: '$6', borderWidth: 1, borderColor: '$border', borderRadius: 12, alignItems: 'center' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Coming Soon</Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
            Personalized research alerts, topic subscriptions, and notification preferences
            will be available in a future update.
          </Text>
        </View>

        <View sx={{ mt: '$4' }}>
          <Link href="/intel">
            <Text sx={{ fontSize: 14, color: '#2563EB' }}>← Back to Research Feed</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
