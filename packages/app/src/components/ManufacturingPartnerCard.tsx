import { View, Text } from 'dripsy';
import { Link } from 'solito/link';

interface ManufacturingPartnerCardProps {
  id: string;
  name: string;
  slug: string;
  type: string;
  capabilities: string[];
  certifications: string[];
  costRangeMin: number | null;
  costRangeMax: number | null;
  turnaroundWeeksMin: number | null;
  turnaroundWeeksMax: number | null;
  country: string;
  regulatorySupport: string[];
  description: string | null;
  score?: number;
  reasons?: string[];
}

const TYPE_LABELS: Record<string, string> = {
  large_cdmo: 'Large CDMO',
  specialized_mrna: 'Specialized mRNA',
  academic_modular: 'Academic / Modular',
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  large_cdmo: { bg: 'blue100', text: 'blue700' },
  specialized_mrna: { bg: 'purple100', text: 'purple700' },
  academic_modular: { bg: 'amber100', text: 'amber700' },
};

const CAPABILITY_LABELS: Record<string, string> = {
  mRNA_synthesis: 'mRNA Synthesis',
  lnp_formulation: 'LNP Formulation',
  fill_finish: 'Fill & Finish',
  plasmid_dna: 'Plasmid DNA',
  quality_control: 'QC',
  analytics: 'Analytics',
  cold_chain: 'Cold Chain',
  lyophilization: 'Lyophilization',
  modified_nucleotides: 'Modified Nucleotides',
  capping: 'Capping',
  self_amplifying_rna: 'saRNA',
  lipid_synthesis: 'Lipid Synthesis',
  research_grade: 'Research Grade',
  technology_transfer: 'Tech Transfer',
  continuous_manufacturing: 'Continuous Mfg',
  miniaturized_production: 'Miniaturized',
  modular_manufacturing: 'Modular Mfg',
  gene_therapy: 'Gene Therapy',
};

function formatCost(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for pricing';
  const fmt = (n: number) => `$${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} \u2014 ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatTurnaround(min: number | null, max: number | null): string {
  if (!min && !max) return 'Contact for timeline';
  if (min && max) return `${min}\u2013${max} weeks`;
  if (min) return `${min}+ weeks`;
  return `Up to ${max} weeks`;
}

export function ManufacturingPartnerCard({
  id,
  name,
  type,
  capabilities,
  certifications,
  costRangeMin,
  costRangeMax,
  turnaroundWeeksMin,
  turnaroundWeeksMax,
  country,
  regulatorySupport,
  description,
  score,
}: ManufacturingPartnerCardProps) {
  const typeLabel = TYPE_LABELS[type] ?? type;
  const typeColors = TYPE_COLORS[type] ?? { bg: 'gray100', text: 'gray700' };

  return (
    <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', p: '$4' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '$2' }}>
        <View sx={{ flex: 1 }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
            <Link href={`/manufacture/partners/${id}`}>
              <Text sx={{ fontWeight: '600', color: 'gray900' }}>{name}</Text>
            </Link>
            <View sx={{ borderRadius: '$sm', bg: typeColors.bg, px: 6, py: 2 }}>
              <Text sx={{ fontSize: 10, fontWeight: '500', color: typeColors.text }}>{typeLabel}</Text>
            </View>
          </View>
          <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>{country}</Text>
        </View>
        <View sx={{ alignItems: 'flex-end' }}>
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray900' }}>
            {formatCost(costRangeMin, costRangeMax)}
          </Text>
          <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
            {formatTurnaround(turnaroundWeeksMin, turnaroundWeeksMax)}
          </Text>
        </View>
      </View>

      {description && (
        <Text numberOfLines={2} sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
          {description}
        </Text>
      )}

      {/* Capabilities */}
      <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
        {capabilities.slice(0, 5).map((cap) => (
          <View key={cap} sx={{ borderRadius: '$sm', bg: 'gray100', px: 6, py: 2 }}>
            <Text sx={{ fontSize: 10, color: 'gray600' }}>{CAPABILITY_LABELS[cap] ?? cap}</Text>
          </View>
        ))}
        {capabilities.length > 5 && (
          <View sx={{ borderRadius: '$sm', bg: 'gray100', px: 6, py: 2 }}>
            <Text sx={{ fontSize: 10, color: 'gray500' }}>+{capabilities.length - 5} more</Text>
          </View>
        )}
      </View>

      {/* Certifications & Regulatory */}
      <View sx={{ mt: '$2', flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
        {certifications.map((cert) => (
          <View key={cert} sx={{ borderRadius: '$sm', bg: 'green50', px: 6, py: 2 }}>
            <Text sx={{ fontSize: 10, fontWeight: '500', color: 'green700' }}>
              {cert.replace(/_/g, ' ')}
            </Text>
          </View>
        ))}
        {regulatorySupport.includes('ind_filing') && (
          <View sx={{ borderRadius: '$sm', bg: 'blue50', px: 6, py: 2 }}>
            <Text sx={{ fontSize: 10, fontWeight: '500', color: 'blue700' }}>IND Support</Text>
          </View>
        )}
      </View>

      {score !== undefined && (
        <View sx={{ mt: '$2' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <View sx={{ height: 6, flex: 1, borderRadius: '$full', bg: 'gray100' }}>
              <View
                sx={{ height: 6, borderRadius: '$full', bg: 'blue500', width: `${score}%` }}
              />
            </View>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray600' }}>
              {score}% match
            </Text>
          </View>
        </View>
      )}

      <View sx={{ mt: '$3', flexDirection: 'row', gap: '$2' }}>
        <Link href={`/manufacture/partners/${id}`}>
          <View sx={{ borderRadius: '$lg', bg: 'blue600', px: '$3', py: 6 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>View details</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}
