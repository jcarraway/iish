import { View, Text, Pressable } from 'dripsy';
import { Link } from 'solito/link';
import type { SequencingProviderDetails } from '@iish/shared';

interface SequencingProviderCardProps {
  providerId: string;
  name: string;
  type: string;
  details: SequencingProviderDetails;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (providerId: string) => void;
}

const TYPE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  commercial: { label: 'Commercial', bg: 'blue100', text: 'blue700' },
  academic: { label: 'Academic', bg: 'purple100', text: 'purple700' },
  emerging: { label: 'Emerging', bg: 'teal100', text: 'teal600' },
};

export function SequencingProviderCard({
  providerId,
  name,
  type,
  details,
  compareMode,
  isSelected,
  onToggleCompare,
}: SequencingProviderCardProps) {
  const badge = TYPE_BADGE[type] ?? TYPE_BADGE.commercial;

  return (
    <View
      sx={{
        borderRadius: '$lg',
        borderWidth: 1,
        borderColor: isSelected ? 'blue400' : 'gray200',
        bg: isSelected ? 'blue50' : '$background',
        p: '$4',
      }}
    >
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '$2' }}>
        <View sx={{ flex: 1 }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
            <Link href={`/sequencing/providers/${providerId}`}>
              <Text sx={{ fontWeight: '600', color: 'gray900' }}>{name}</Text>
            </Link>
            <View sx={{ borderRadius: '$sm', bg: badge.bg, px: 6, py: 2 }}>
              <Text sx={{ fontSize: 10, fontWeight: '500', color: badge.text }}>{badge.label}</Text>
            </View>
            {details.fdaApproved && (
              <View sx={{ borderRadius: '$sm', bg: 'green100', px: 6, py: 2 }}>
                <Text sx={{ fontSize: 10, fontWeight: '500', color: 'green700' }}>FDA Approved</Text>
              </View>
            )}
          </View>
          <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
            {details.testNames.join(', ')}
          </Text>
        </View>
        {compareMode && (
          <Pressable
            onPress={() => onToggleCompare?.(providerId)}
            sx={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <View
              sx={{
                height: 16,
                width: 16,
                borderRadius: '$sm',
                borderWidth: 1,
                borderColor: isSelected ? 'blue600' : 'gray300',
                bg: isSelected ? 'blue600' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isSelected && (
                <Text sx={{ fontSize: 10, color: 'white' }}>{'\u2713'}</Text>
              )}
            </View>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Compare</Text>
          </Pressable>
        )}
      </View>

      <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
        {[
          { label: 'Genes', value: String(details.geneCount) },
          { label: 'Turnaround', value: `${details.turnaroundDays.min}-${details.turnaroundDays.max} days` },
          { label: 'Sample', value: details.sampleTypes[0] },
          {
            label: 'Cost',
            value:
              details.costRange.min === 0 && details.costRange.max === 0
                ? 'Included'
                : `$${details.costRange.min.toLocaleString()}-$${details.costRange.max.toLocaleString()}`,
          },
        ].map((item) => (
          <View key={item.label} sx={{ width: '48%', mb: '$1' }}>
            <Text sx={{ fontSize: '$sm' }}>
              <Text sx={{ color: 'gray500' }}>{item.label}: </Text>
              <Text sx={{ fontWeight: '500', color: 'gray900' }}>{item.value}</Text>
            </Text>
          </View>
        ))}
      </View>

      <View sx={{ mt: '$3', flexDirection: 'row', gap: '$2' }}>
        <Link href={`/sequencing/providers/${providerId}`}>
          <View sx={{ borderRadius: '$lg', bg: 'blue600', px: '$3', py: 6 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>View details</Text>
          </View>
        </Link>
        <Link href="/sequencing/insurance">
          <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray300', px: '$3', py: 6 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>Check coverage</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}
