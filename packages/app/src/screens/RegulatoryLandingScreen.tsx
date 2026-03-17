import { View, Text, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

const PATHWAYS = [
  {
    name: 'Clinical Trial',
    desc: 'Enroll in an active clinical trial testing personalized cancer vaccines. Treatment is provided at no cost with rigorous safety monitoring.',
    cost: '$0 — $25K',
    timeline: '2 — 6 months',
    color: 'green700',
  },
  {
    name: 'FDA Expanded Access',
    desc: 'Request access to an investigational drug outside of a clinical trial when no comparable alternatives exist.',
    cost: '$50K — $200K',
    timeline: '4 — 12 weeks',
    color: 'blue700',
  },
  {
    name: 'Right to Try',
    desc: 'Access investigational treatments that have completed Phase I trials, without FDA authorization.',
    cost: '$75K — $250K',
    timeline: '2 — 8 weeks',
    color: 'purple700',
  },
  {
    name: 'Physician-Sponsored IND',
    desc: 'Your physician files an Investigational New Drug application with the FDA to administer a personalized vaccine.',
    cost: '$100K — $400K',
    timeline: '8 — 16 weeks',
    color: 'amber700',
  },
];

export function RegulatoryLandingScreen() {
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Regulatory Pathways
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Understand your legal options for accessing a personalized cancer vaccine outside of a
          standard clinical trial.
        </Text>

        <View sx={{ mt: '$8', gap: 16 }}>
          {PATHWAYS.map((pathway) => (
            <View key={pathway.name} sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
              <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900' }}>{pathway.name}</Text>
              <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>{pathway.desc}</Text>
              <View sx={{ mt: '$3', flexDirection: 'row', gap: 24 }}>
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Est. Cost</Text>
                  <Text sx={{ fontSize: '$sm', fontWeight: '600', color: pathway.color as any }}>
                    {pathway.cost}
                  </Text>
                </View>
                <View>
                  <Text sx={{ fontSize: 11, color: 'gray500' }}>Timeline</Text>
                  <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray900' }}>
                    {pathway.timeline}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Link href="/manufacture/regulatory/assessment">
          <View sx={{ mt: '$8', bg: 'purple600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
              Start Pathway Assessment
            </Text>
          </View>
        </Link>

        <View sx={{ mt: '$6', p: '$4', bg: 'gray50', borderRadius: '$lg' }}>
          <Text sx={{ fontSize: 11, color: 'gray500' }}>
            <Text sx={{ fontWeight: '700' }}>Disclaimer:</Text> This information is for educational
            purposes only and does not constitute legal or medical advice. Regulatory pathways
            vary by jurisdiction and individual circumstances. Consult with your physician and a
            regulatory affairs professional before pursuing any pathway.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
