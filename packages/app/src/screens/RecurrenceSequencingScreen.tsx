import { View, Text, ScrollView } from 'dripsy';
import { Link } from 'solito/link';

const REASONS = [
  {
    title: 'The recurrent tumor may be biologically different',
    detail: 'Cancer cells evolve over time and under treatment pressure. The recurrent tumor may have acquired new mutations — including resistance mutations — that weren\'t present in the original tumor.',
  },
  {
    title: 'New mutations can unlock new treatments',
    detail: 'Genomic changes in the recurrent tumor may make you eligible for targeted therapies, immunotherapies, or clinical trials that weren\'t options before.',
  },
  {
    title: 'Better treatment targeting',
    detail: 'Understanding which mutations survived treatment helps your oncologist choose therapies that target the actual biology of your cancer now — not what it was before.',
  },
];

const BIOPSY_COMPARISON = [
  {
    type: 'Tissue Biopsy',
    pros: ['Most comprehensive genomic data', 'Standard of care', 'Can identify tumor microenvironment'],
    cons: ['Requires invasive procedure', 'May not be feasible for all tumor locations', 'Single time point'],
  },
  {
    type: 'Liquid Biopsy (ctDNA)',
    pros: ['Non-invasive blood draw', 'Can detect multiple tumor sites', 'Easy to repeat over time'],
    cons: ['May miss some mutations', 'Less comprehensive than tissue', 'Not all cancers shed detectable ctDNA'],
  },
];

export function RecurrenceSequencingScreen() {
  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 640, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: 'bold', color: '$foreground' }}>
          Why Re-Sequencing Matters
        </Text>
        <Text sx={{ mt: '$3', fontSize: 16, color: '$mutedForeground', lineHeight: 26 }}>
          Genomic testing of the recurrent tumor can reveal critical changes that
          open new treatment options.
        </Text>

        {/* Reasons */}
        <View sx={{ mt: '$8', gap: '$5' }}>
          {REASONS.map((r, i) => (
            <View key={i} sx={{
              borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
            }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                <View sx={{
                  width: 32, height: 32, borderRadius: 16,
                  backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text sx={{ fontSize: 14, fontWeight: '700', color: 'blue600' }}>
                    {i + 1}
                  </Text>
                </View>
                <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground', flex: 1 }}>
                  {r.title}
                </Text>
              </View>
              <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
                {r.detail}
              </Text>
            </View>
          ))}
        </View>

        {/* Tissue vs Liquid comparison */}
        <Text sx={{ mt: '$10', fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
          Tissue vs. Liquid Biopsy
        </Text>
        <View sx={{ mt: '$4', gap: '$4' }}>
          {BIOPSY_COMPARISON.map(b => (
            <View key={b.type} sx={{
              borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5',
            }}>
              <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                {b.type}
              </Text>
              <Text sx={{ mt: '$3', fontSize: 13, fontWeight: '600', color: '#16A34A' }}>
                Advantages:
              </Text>
              {b.pros.map((p, i) => (
                <Text key={i} sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                  + {p}
                </Text>
              ))}
              <Text sx={{ mt: '$3', fontSize: 13, fontWeight: '600', color: '#DC2626' }}>
                Limitations:
              </Text>
              {b.cons.map((c, i) => (
                <Text key={i} sx={{ fontSize: 13, color: '$mutedForeground', mt: '$1' }}>
                  - {c}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {/* Links */}
        <View sx={{ mt: '$8', gap: '$3' }}>
          <Link href="/sequencing/insurance">
            <View sx={{
              borderRadius: 8, borderWidth: 1, borderColor: '$border',
              px: '$5', py: '$3',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Check insurance coverage for genomic testing
              </Text>
            </View>
          </Link>
          <Link href="/sequencing/guide">
            <View sx={{
              borderRadius: 8, borderWidth: 1, borderColor: '$border',
              px: '$5', py: '$3',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                Start the sequencing journey
              </Text>
            </View>
          </Link>
        </View>

        <Link href="/survive/recurrence/status">
          <Text sx={{ mt: '$6', fontSize: 14, color: 'blue600' }}>
            Back to cascade status
          </Text>
        </Link>
      </View>
    </ScrollView>
  );
}
