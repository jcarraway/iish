import { View, Text, Pressable, ScrollView } from 'dripsy';
import { Linking } from 'react-native';
import { Link } from 'solito/link';
import { useGetCareTeamQuery } from '../generated/graphql';

const CRISIS_RESOURCES = [
  {
    name: 'Crisis Text Line',
    action: 'Text HOME to 741741',
    description: 'Free 24/7 crisis support via text message',
    type: 'text' as const,
    value: 'sms:741741&body=HOME',
  },
  {
    name: '988 Suicide & Crisis Lifeline',
    action: 'Call or text 988',
    description: '24/7 mental health crisis support',
    type: 'phone' as const,
    value: 'tel:988',
  },
  {
    name: 'Cancer Support Community Helpline',
    action: 'Call 888-793-9355',
    description: 'Free emotional support from trained oncology counselors',
    type: 'phone' as const,
    value: 'tel:8887939355',
  },
];

const PEER_SUPPORT = [
  {
    name: 'Imerman Angels',
    description: 'One-on-one cancer support matched by cancer type, age, and gender.',
    url: 'https://imermanangels.org',
  },
  {
    name: 'Cancer Hope Network',
    description: 'Trained survivor volunteers who have faced recurrence themselves.',
    url: 'https://www.cancerhopenetwork.org',
  },
  {
    name: 'Cancer Support Community',
    description: 'Free support groups, including groups specifically for recurrence.',
    url: 'https://www.cancersupportcommunity.org',
  },
];

export function RecurrenceSupportScreen() {
  const { data: careTeamData } = useGetCareTeamQuery({ errorPolicy: 'ignore' });
  const oncologist = careTeamData?.careTeam?.find(
    m => m.role.toLowerCase().includes('oncolog'),
  );

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Support & Resources
        </Text>
        <Text sx={{ mt: '$3', fontSize: 16, color: '$mutedForeground', lineHeight: 26 }}>
          It's okay to not be okay right now. Reaching out is a sign of strength, not weakness.
        </Text>

        {/* Crisis resources — ALWAYS first */}
        <View sx={{
          mt: '$8', borderRadius: 12, borderWidth: 2, borderColor: '#F59E0B',
          backgroundColor: '#FFFBEB', p: '$5',
        }}>
          <Text sx={{ fontSize: 18, fontWeight: '700', color: '#92400E' }}>
            Need to talk right now?
          </Text>
          <View sx={{ mt: '$4', gap: '$4' }}>
            {CRISIS_RESOURCES.map(r => (
              <Pressable key={r.name} onPress={() => Linking.openURL(r.value)}>
                <View sx={{ gap: '$1' }}>
                  <Text sx={{ fontSize: 16, fontWeight: '600', color: '#92400E' }}>
                    {r.name}
                  </Text>
                  <Text sx={{ fontSize: 15, fontWeight: '700', color: '#78350F' }}>
                    {r.action}
                  </Text>
                  <Text sx={{ fontSize: 13, color: '#A16207' }}>{r.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Your oncologist */}
        {oncologist && (
          <View sx={{
            mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
          }}>
            <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
              Your Oncologist
            </Text>
            <Text sx={{ mt: '$2', fontSize: 15, color: '$foreground' }}>
              {oncologist.name}
            </Text>
            {oncologist.practice && (
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>
                {oncologist.practice}
              </Text>
            )}
            {oncologist.phone && (
              <Pressable onPress={() => Linking.openURL(`tel:${oncologist.phone}`)}>
                <Text sx={{ mt: '$2', fontSize: 14, fontWeight: '600', color: 'blue600' }}>
                  Call {oncologist.phone}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Peer support */}
        <Text sx={{ mt: '$8', fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
          Peer Support
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
          Connecting with someone who has been through recurrence can be incredibly helpful.
        </Text>
        <View sx={{ mt: '$4', gap: '$3' }}>
          {PEER_SUPPORT.map(p => (
            <Pressable key={p.name} onPress={() => Linking.openURL(p.url)}>
              <View sx={{
                borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$4',
              }}>
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                  {p.name}
                </Text>
                <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                  {p.description}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>Visit website</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* What to expect */}
        <View sx={{
          mt: '$8', borderRadius: 12, backgroundColor: '#F0FDF4', p: '$5',
        }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '#166534' }}>
            What happens next
          </Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '#166534', lineHeight: 22 }}>
            We're already working behind the scenes to update your trial matches,
            financial assistance options, and care recommendations based on your new situation.
            Take the time you need — everything will be ready when you are.
          </Text>
        </View>

        <View sx={{ mt: '$6', gap: '$3' }}>
          <Link href="/survive/recurrence">
            <Text sx={{ fontSize: 14, color: 'blue600' }}>
              Back to recurrence response
            </Text>
          </Link>
          <Link href="/survive/mental-health">
            <Text sx={{ fontSize: 14, color: 'blue600' }}>
              More mental health resources
            </Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}
