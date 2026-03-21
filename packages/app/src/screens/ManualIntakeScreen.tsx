import { View, Text } from 'dripsy';
import { useRouter } from 'solito/router';
import { Platform } from 'react-native';
import { ManualIntakeWizard } from '../components';
import type { PatientProfile } from '@iish/shared';

export function ManualIntakeScreen() {
  const router = useRouter();

  const handleComplete = (profile: PatientProfile) => {
    if (Platform.OS === 'web') {
      sessionStorage.setItem('iish_manual_profile', JSON.stringify(profile));
    }
    router.push('/start/confirm?path=manual');
  };

  return (
    <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
      <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Enter your details</Text>
      <Text sx={{ mt: '$2', mb: '$8', fontSize: 14, color: '$mutedForeground' }}>
        Fill out the form below with your cancer diagnosis details.
        This information helps us find the best trial matches for you.
      </Text>
      <ManualIntakeWizard onComplete={handleComplete} />
    </View>
  );
}
