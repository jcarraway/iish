import { View, Text, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5', mt: '$4' }}>
      <Text sx={{ fontSize: 18, fontWeight: '700', color: '$foreground', mb: '$3' }}>{title}</Text>
      {children}
    </View>
  );
}

function ProviderCard({
  name,
  approach,
  details,
}: {
  name: string;
  approach: string;
  details: string[];
}) {
  return (
    <View sx={{
      borderRadius: 10, borderWidth: 1, borderColor: '$border',
      p: '$4', mt: '$3', backgroundColor: '$muted',
    }}>
      <Text sx={{ fontSize: 16, fontWeight: '700', color: '$foreground' }}>{name}</Text>
      <Text sx={{ fontSize: 13, fontWeight: '600', color: 'blue600', mt: '$1' }}>{approach}</Text>
      {details.map((d, i) => (
        <Text key={i} sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
          {'\u2022'} {d}
        </Text>
      ))}
    </View>
  );
}

function ResultCard({
  label,
  color,
  description,
}: {
  label: string;
  color: string;
  description: string;
}) {
  return (
    <View sx={{
      borderRadius: 10, borderWidth: 1, borderColor: '$border',
      p: '$4', mt: '$3', flexDirection: 'row', gap: '$3', alignItems: 'flex-start',
    }}>
      <View sx={{
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: color, mt: 4,
      }} />
      <View sx={{ flex: 1 }}>
        <Text sx={{ fontSize: 14, fontWeight: '700', color: '$foreground' }}>{label}</Text>
        <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>{description}</Text>
      </View>
    </View>
  );
}

export function CtdnaGuideScreen() {
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Understanding ctDNA Monitoring
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          A guide to circulating tumor DNA testing in survivorship
        </Text>

        <InfoCard title="What is ctDNA?">
          <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
            Cancer cells can shed tiny fragments of their DNA into the bloodstream. These fragments
            are called circulating tumor DNA (ctDNA). A simple blood draw can detect these fragments,
            potentially identifying cancer activity months before it would show up on imaging like
            CT scans or MRIs.
          </Text>
          <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, mt: '$3' }}>
            ctDNA testing is sometimes called a "liquid biopsy" because it provides information
            about cancer through a blood sample rather than a tissue biopsy.
          </Text>
          <View sx={{
            mt: '$4', p: '$4', borderRadius: 10,
            backgroundColor: '#DBEAFE',
          }}>
            <Text sx={{ fontSize: 13, fontWeight: '600', color: '#1E40AF' }}>Key point</Text>
            <Text sx={{ fontSize: 13, color: '#1E40AF', mt: '$1' }}>
              A positive ctDNA result does not definitively mean your cancer has returned. It means
              cancer DNA was found in your blood and warrants further investigation with your oncologist.
            </Text>
          </View>
        </InfoCard>

        <InfoCard title="ctDNA Test Providers">
          <Text sx={{ fontSize: 14, color: '$mutedForeground', mb: '$1' }}>
            Two leading providers offer different approaches to ctDNA monitoring:
          </Text>
          <ProviderCard
            name="Natera Signatera"
            approach="Tumor-Informed (Personalized Panel)"
            details={[
              'Creates a custom panel from your original tumor tissue',
              'Highest sensitivity for detecting minimal residual disease',
              'Requires initial tumor tissue sample',
              'Custom panel design takes 4-6 weeks initially',
              'Subsequent blood tests return results in ~2 weeks',
            ]}
          />
          <ProviderCard
            name="Guardant Reveal"
            approach="Tumor-Naive (Standardized Panel)"
            details={[
              'Works from a blood draw alone — no tumor tissue needed',
              'Faster initial turnaround (no custom panel step)',
              'Slightly lower sensitivity for some cancer types',
              'Good option when tumor tissue is unavailable',
              'Results typically in 2-3 weeks',
            ]}
          />
        </InfoCard>

        <InfoCard title="Who Benefits Most?">
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>Strong evidence:</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
            {'\u2022'} High-risk stage II and stage III patients
          </Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
            {'\u2022'} Post-neoadjuvant patients with residual disease
          </Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
            {'\u2022'} Triple-negative breast cancer (TNBC)
          </Text>

          <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground', mt: '$4' }}>Growing evidence:</Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
            {'\u2022'} Stage I with high-risk features
          </Text>
          <Text sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
            {'\u2022'} Other cancer subtypes
          </Text>

          <Text sx={{ fontSize: 14, color: '$foreground', mt: '$4', fontStyle: 'italic' }}>
            Discuss with your oncologist whether ctDNA monitoring is right for your specific situation.
          </Text>
        </InfoCard>

        <InfoCard title="Insurance & Cost">
          <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22 }}>
            Insurance coverage for ctDNA monitoring is evolving rapidly. Medicare now covers Signatera
            for certain cancers, and private insurers are increasingly approving coverage.
          </Text>
          <Text sx={{ fontSize: 14, color: '$foreground', lineHeight: 22, mt: '$3' }}>
            If initially denied, appeals are often successful. Both Natera and Guardant offer
            financial assistance programs to reduce out-of-pocket costs.
          </Text>
          <Link href="/financial">
            <Text sx={{ fontSize: 13, color: 'blue600', mt: '$3' }}>
              View financial assistance resources {'\u2192'}
            </Text>
          </Link>
        </InfoCard>

        <InfoCard title="What Results Mean">
          <ResultCard
            label="Not Detected"
            color="#22C55E"
            description="No cancer DNA was found in your blood sample. This is reassuring, though continued monitoring remains important as part of your surveillance plan."
          />
          <ResultCard
            label="Detected"
            color="#F59E0B"
            description="Cancer DNA was found in your blood sample. This warrants prompt discussion with your oncologist. It does not definitively mean cancer has returned — further investigation is needed."
          />
          <ResultCard
            label="Indeterminate"
            color="#9CA3AF"
            description="The test result was inconclusive. This can happen for technical reasons. Your oncologist will likely recommend repeating the test."
          />
        </InfoCard>

        <View sx={{
          mt: '$6', p: '$4', borderRadius: 10,
          backgroundColor: '$muted', borderWidth: 1, borderColor: '$border',
        }}>
          <Text sx={{ fontSize: 12, color: '$mutedForeground', fontStyle: 'italic' }}>
            This information is for educational purposes only. ctDNA test results should always be
            interpreted by your oncologist in the context of your complete clinical picture. OncoVax
            does not provide medical diagnoses.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
