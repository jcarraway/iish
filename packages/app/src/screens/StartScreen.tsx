import { View, Text } from 'dripsy';
import { Link } from 'solito/link';

const PATHS = [
  {
    href: '/start/upload',
    title: 'Upload your pathology report',
    description: 'Take a photo or upload a PDF. Our AI extracts your details automatically.',
  },
  {
    href: '/start/mychart',
    title: 'Connect MyChart',
    description: 'Pull your records automatically from your healthcare provider.',
  },
  {
    href: '/start/manual',
    title: 'Enter details manually',
    description: 'Fill out a form with your diagnosis information. Takes about 5 minutes.',
  },
];

export function StartScreen() {
  return (
    <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
      <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>
        Let&apos;s get your cancer details
      </Text>
      <Text sx={{ mt: '$2', color: '$mutedForeground' }}>
        Choose how you&apos;d like to share your medical information. We&apos;ll use it to match you with clinical trials.
      </Text>
      <View sx={{ mt: '$8', gap: '$4' }}>
        {PATHS.map((path) => (
          <Link key={path.href} href={path.href}>
            <View sx={{ borderWidth: 1, borderColor: '$border', borderRadius: '$lg', p: '$6' }}>
              <Text sx={{ fontSize: '$lg', fontWeight: '600', color: '$foreground' }}>
                {path.title}
              </Text>
              <Text sx={{ mt: '$1', fontSize: '$sm', color: '$mutedForeground' }}>
                {path.description}
              </Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}
