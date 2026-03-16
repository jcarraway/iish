import { View, Text, ScrollView } from 'dripsy';

interface VaccineBlueprint {
  epitopeCount?: number;
  targetedGenes?: string[];
  constructLength?: number;
  deliveryMethod?: string;
  mRnaSequence?: string;
  signalPeptide?: string;
  universalHelper?: string;
  fivePrimeUtr?: string;
  threePrimeUtr?: string;
  polyATailLength?: number;
  epitopes?: {
    gene: string;
    peptide: string;
    hlaAllele: string;
    linker?: string;
  }[];
  hlaGenotype?: Record<string, string[]>;
  lnpFormulation?: {
    ionizableLipid?: string;
    particleSizeNm?: string;
  };
  [key: string]: unknown;
}

interface BlueprintVisualizationProps {
  blueprint: VaccineBlueprint;
  hlaGenotype: Record<string, string[]> | null;
}

const SEGMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  utr5: { bg: 'blue200', text: 'blue800', label: "5' UTR" },
  signal: { bg: 'orange200', text: 'orange600', label: 'Signal Peptide' },
  epitope: { bg: 'purple200', text: 'purple800', label: 'Epitope' },
  linker: { bg: 'gray200', text: 'gray600', label: 'Linker' },
  helper: { bg: 'green200', text: 'green800', label: 'PADRE' },
  utr3: { bg: 'blue200', text: 'blue800', label: "3' UTR" },
  polyA: { bg: 'yellow200', text: 'yellow800', label: 'Poly-A' },
};

export function BlueprintVisualization({ blueprint, hlaGenotype }: BlueprintVisualizationProps) {
  const epitopes = blueprint.epitopes ?? [];
  const hla = hlaGenotype ?? blueprint.hlaGenotype ?? {};

  const segments: { type: string; label: string; detail?: string }[] = [];
  if (blueprint.fivePrimeUtr) segments.push({ type: 'utr5', label: "5' UTR" });
  if (blueprint.signalPeptide) segments.push({ type: 'signal', label: 'Signal', detail: blueprint.signalPeptide });
  epitopes.forEach((ep, i) => {
    segments.push({ type: 'epitope', label: ep.gene, detail: ep.peptide });
    if (ep.linker && i < epitopes.length - 1) {
      segments.push({ type: 'linker', label: ep.linker });
    }
  });
  if (blueprint.universalHelper) segments.push({ type: 'helper', label: 'PADRE', detail: blueprint.universalHelper });
  if (blueprint.threePrimeUtr) segments.push({ type: 'utr3', label: "3' UTR" });
  if (blueprint.polyATailLength) segments.push({ type: 'polyA', label: `Poly-A (${blueprint.polyATailLength}nt)` });

  return (
    <View sx={{ gap: '$6' }}>
      {/* Summary Stats */}
      <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$4' }}>
        {[
          { value: String(blueprint.epitopeCount ?? epitopes.length), label: 'Epitopes' },
          { value: String((blueprint.targetedGenes ?? [...new Set(epitopes.map((e) => e.gene))]).length), label: 'Targeted Genes' },
          { value: blueprint.constructLength != null ? String(blueprint.constructLength) : 'N/A', label: 'Construct Length (aa)' },
          { value: blueprint.deliveryMethod ?? 'LNP-mRNA', label: 'Delivery' },
        ].map((stat) => (
          <View
            key={stat.label}
            sx={{
              borderRadius: '$xl',
              borderWidth: 1,
              borderColor: 'gray200',
              p: '$4',
              alignItems: 'center',
              width: ['48%', '48%', '23%'],
            }}
          >
            <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'purple600' }}>{stat.value}</Text>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Polyepitope Construct Diagram */}
      {segments.length > 0 && (
        <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>Polyepitope Construct</Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: '$1' }}>
            {segments.map((seg, i) => {
              const colors = SEGMENT_COLORS[seg.type] ?? SEGMENT_COLORS.epitope;
              return (
                <View key={i} sx={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View sx={{ bg: colors.bg, borderRadius: '$sm', px: '$2', py: '$1' }}>
                    <Text sx={{ fontSize: '$xs', fontWeight: '500', color: colors.text }}>
                      {seg.label}
                    </Text>
                  </View>
                  {i < segments.length - 1 &&
                    seg.type !== 'linker' &&
                    segments[i + 1]?.type !== 'linker' && (
                      <Text sx={{ color: 'gray300', mx: 2 }}>{'\u2192'}</Text>
                    )}
                </View>
              );
            })}
          </View>
          {/* Legend */}
          <View sx={{ mt: '$4', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
            {Object.entries(SEGMENT_COLORS).map(([key, val]) => (
              <View key={key} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                <View sx={{ height: 12, width: 12, borderRadius: '$sm', bg: val.bg }} />
                <Text sx={{ fontSize: '$xs', color: 'gray500' }}>{val.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* mRNA Sequence Display */}
      {blueprint.mRnaSequence && (
        <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>mRNA Sequence</Text>
          <ScrollView horizontal>
            <View sx={{ bg: 'gray50', borderRadius: '$lg', p: '$4' }}>
              <Text sx={{ fontFamily: 'root', fontSize: '$xs', color: 'gray700' }}>
                {blueprint.mRnaSequence.length > 200
                  ? `${blueprint.mRnaSequence.slice(0, 200)}...`
                  : blueprint.mRnaSequence}
              </Text>
            </View>
          </ScrollView>
          <Text sx={{ mt: '$2', fontSize: '$xs', color: 'gray400' }}>
            Length: {blueprint.mRnaSequence.length} nt
          </Text>
        </View>
      )}

      {/* HLA Coverage Grid */}
      {Object.keys(hla).length > 0 && (
        <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>HLA Genotype</Text>
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$4' }}>
            {Object.entries(hla).map(([locus, alleles]) => (
              <View
                key={locus}
                sx={{ borderRadius: '$lg', bg: 'gray50', p: '$3', width: ['100%', '30%'] }}
              >
                <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray400', mb: '$1' }}>
                  {locus}
                </Text>
                <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$1' }}>
                  {(alleles as string[]).map((allele, i) => (
                    <View key={i} sx={{ borderRadius: '$sm', bg: 'purple100', px: '$2', py: 2 }}>
                      <Text sx={{ fontSize: '$xs', color: 'purple800' }}>{allele}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Delivery Specs */}
      {blueprint.lnpFormulation && (
        <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>Delivery Specifications</Text>
          <View sx={{ gap: '$3' }}>
            {blueprint.lnpFormulation.ionizableLipid && (
              <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text sx={{ fontSize: '$sm', color: 'gray400' }}>Ionizable Lipid</Text>
                <Text sx={{ fontSize: '$sm', color: 'gray700' }}>
                  {blueprint.lnpFormulation.ionizableLipid}
                </Text>
              </View>
            )}
            {blueprint.lnpFormulation.particleSizeNm && (
              <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text sx={{ fontSize: '$sm', color: 'gray400' }}>Particle Size</Text>
                <Text sx={{ fontSize: '$sm', color: 'gray700' }}>
                  {blueprint.lnpFormulation.particleSizeNm}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
