import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';

interface Neoantigen {
  id: string;
  gene: string;
  mutation: string;
  chromosome: string;
  position: number;
  refAllele: string;
  altAllele: string;
  variantType: string;
  vaf: number;
  wildtypePeptide: string;
  mutantPeptide: string;
  peptideLength: number;
  hlaAllele: string;
  bindingAffinityNm: number;
  bindingRankPercentile: number;
  wildtypeBindingNm: number | null;
  bindingClass: string;
  immunogenicityScore: number;
  agretopicity: number;
  expressionLevel: number | null;
  clonality: number;
  structurePdbPath: string | null;
  structuralExposure: number | null;
  compositeScore: number;
  rank: number;
  confidence: string;
  details: Record<string, unknown>;
}

interface NeoantigenTableProps {
  neoantigens: Neoantigen[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const CONFIDENCE_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: 'green100', text: 'green800' },
  medium: { bg: 'yellow100', text: 'yellow800' },
  low: { bg: 'red100', text: 'red800' },
};

const BINDING_CLASS_COLORS: Record<string, { bg: string; text: string }> = {
  strong_binder: { bg: 'green100', text: 'green800' },
  weak_binder: { bg: 'yellow100', text: 'yellow800' },
  non_binder: { bg: 'red100', text: 'red800' },
};

const COLUMNS = [
  { key: 'rank', label: '#', width: 36 },
  { key: 'gene', label: 'Gene', width: 60 },
  { key: 'mutation', label: 'Mutation', width: 90 },
  { key: 'mutantPeptide', label: 'Peptide', width: 100 },
  { key: 'hlaAllele', label: 'HLA', width: 90 },
  { key: 'bindingAffinityNm', label: 'Affinity', width: 70 },
  { key: 'bindingClass', label: 'Class', width: 80 },
  { key: 'immunogenicityScore', label: 'Immuno', width: 60 },
  { key: 'compositeScore', label: 'Score', width: 60 },
  { key: 'confidence', label: 'Conf', width: 60 },
];

export function NeoantigenTable({ neoantigens, sortField, sortOrder, onSort }: NeoantigenTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ScrollView horizontal>
      <View sx={{ minWidth: 700 }}>
        {/* Header */}
        <View sx={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: 'gray200', pb: '$2' }}>
          {COLUMNS.map((col) => (
            <Pressable
              key={col.key}
              onPress={() => onSort(col.key)}
              sx={{ width: col.width, pr: '$2' }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                <Text sx={{ fontSize: '$xs', color: 'gray500' }}>{col.label}</Text>
                {sortField === col.key && (
                  <Text sx={{ fontSize: '$xs', color: 'purple600' }}>
                    {sortOrder === 'asc' ? '\u2191' : '\u2193'}
                  </Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Rows */}
        {neoantigens.map((neo) => (
          <View key={neo.id}>
            <Pressable
              onPress={() => setExpandedId(expandedId === neo.id ? null : neo.id)}
              sx={{
                flexDirection: 'row',
                borderBottomWidth: 1,
                borderColor: 'gray100',
                py: '$2',
              }}
            >
              <View sx={{ width: 36, pr: '$2' }}>
                <Text sx={{ fontSize: '$sm', color: 'gray400' }}>{neo.rank}</Text>
              </View>
              <View sx={{ width: 60, pr: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500' }}>{neo.gene}</Text>
              </View>
              <View sx={{ width: 90, pr: '$2' }}>
                <Text sx={{ fontSize: '$xs', color: 'gray600' }}>{neo.mutation}</Text>
              </View>
              <View sx={{ width: 100, pr: '$2' }}>
                <Text sx={{ fontSize: '$xs' }}>{neo.mutantPeptide}</Text>
              </View>
              <View sx={{ width: 90, pr: '$2' }}>
                <Text sx={{ fontSize: '$xs', color: 'gray600' }}>{neo.hlaAllele}</Text>
              </View>
              <View sx={{ width: 70, pr: '$2' }}>
                <Text sx={{ fontSize: '$sm' }}>{neo.bindingAffinityNm.toFixed(1)}</Text>
              </View>
              <View sx={{ width: 80, pr: '$2' }}>
                {(() => {
                  const colors = BINDING_CLASS_COLORS[neo.bindingClass] ?? { bg: 'gray100', text: 'gray800' };
                  return (
                    <View sx={{ borderRadius: '$full', bg: colors.bg, px: '$2', py: 2, alignSelf: 'flex-start' }}>
                      <Text sx={{ fontSize: '$xs', fontWeight: '500', color: colors.text }}>
                        {neo.bindingClass.replace('_', ' ')}
                      </Text>
                    </View>
                  );
                })()}
              </View>
              <View sx={{ width: 60, pr: '$2' }}>
                <Text sx={{ fontSize: '$sm' }}>{neo.immunogenicityScore.toFixed(2)}</Text>
              </View>
              <View sx={{ width: 60, pr: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500' }}>{neo.compositeScore.toFixed(2)}</Text>
              </View>
              <View sx={{ width: 60 }}>
                {(() => {
                  const colors = CONFIDENCE_COLORS[neo.confidence] ?? { bg: 'gray100', text: 'gray800' };
                  return (
                    <View sx={{ borderRadius: '$full', bg: colors.bg, px: '$2', py: 2, alignSelf: 'flex-start' }}>
                      <Text sx={{ fontSize: '$xs', fontWeight: '500', color: colors.text }}>
                        {neo.confidence}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </Pressable>

            {/* Expanded detail */}
            {expandedId === neo.id && (
              <View sx={{ bg: 'gray50', p: '$4' }}>
                <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$4' }}>
                  <View sx={{ width: ['48%', '23%'] }}>
                    <Text sx={{ fontSize: '$xs', color: 'gray400', mb: '$1' }}>Variant</Text>
                    <Text sx={{ fontSize: '$xs' }}>
                      {neo.chromosome}:{neo.position} {neo.refAllele}{'>'}{neo.altAllele}
                    </Text>
                    <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
                      {neo.variantType} | VAF: {(neo.vaf * 100).toFixed(1)}%
                    </Text>
                  </View>
                  <View sx={{ width: ['48%', '23%'] }}>
                    <Text sx={{ fontSize: '$xs', color: 'gray400', mb: '$1' }}>Wildtype Peptide</Text>
                    <Text sx={{ fontSize: '$xs' }}>{neo.wildtypePeptide}</Text>
                    <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
                      WT Binding: {neo.wildtypeBindingNm?.toFixed(1) ?? 'N/A'} nM
                    </Text>
                  </View>
                  <View sx={{ width: ['48%', '23%'] }}>
                    <Text sx={{ fontSize: '$xs', color: 'gray400', mb: '$1' }}>Binding Details</Text>
                    <Text sx={{ fontSize: '$xs' }}>Rank %ile: {neo.bindingRankPercentile.toFixed(2)}%</Text>
                    <Text sx={{ fontSize: '$xs' }}>Agretopicity: {neo.agretopicity.toFixed(3)}</Text>
                  </View>
                  <View sx={{ width: ['48%', '23%'] }}>
                    <Text sx={{ fontSize: '$xs', color: 'gray400', mb: '$1' }}>
                      Expression & Clonality
                    </Text>
                    <Text sx={{ fontSize: '$xs' }}>
                      Expression: {neo.expressionLevel?.toFixed(1) ?? 'N/A'}
                    </Text>
                    <Text sx={{ fontSize: '$xs' }}>
                      Clonality: {(neo.clonality * 100).toFixed(1)}%
                    </Text>
                  </View>
                  {neo.structuralExposure !== null && (
                    <View sx={{ width: ['48%', '23%'] }}>
                      <Text sx={{ fontSize: '$xs', color: 'gray400', mb: '$1' }}>Structure</Text>
                      <Text sx={{ fontSize: '$xs' }}>
                        Surface exposure: {neo.structuralExposure.toFixed(2)}
                      </Text>
                      {neo.structurePdbPath && (
                        <Text sx={{ fontSize: '$xs', color: 'purple600' }}>PDB available</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
