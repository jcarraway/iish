import { View, Text } from 'dripsy';

export function LearnScreen() {
  return (
    <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
      <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>
        Learn about cancer vaccines
      </Text>
      <Text sx={{ mt: '$2', color: '$mutedForeground' }}>
        Educational content about personalized cancer vaccines, clinical trials,
        and what to expect during the trial matching process.
      </Text>
    </View>
  );
}
