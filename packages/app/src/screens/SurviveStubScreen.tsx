import { View, Text, Pressable } from 'dripsy';
import { useRouter } from 'solito/router';

interface SurviveStubScreenProps {
  title?: string;
}

export function SurviveStubScreen({ title = 'Coming Soon' }: SurviveStubScreenProps) {
  const router = useRouter();

  return (
    <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
      <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
      <View sx={{
        mt: '$8',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '$border',
        borderRadius: 16,
        p: '$8',
        alignItems: 'center',
      }}>
        <Text sx={{ fontSize: 36 }}>🚧</Text>
        <Text sx={{ mt: '$3', fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
          Coming in a future update
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', textAlign: 'center' }}>
          This section is part of the survivorship experience and will be available soon.
        </Text>
        <Pressable onPress={() => router.back()}>
          <View sx={{
            mt: '$5',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 8,
            px: '$6',
            py: '$3',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>Go back</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
