import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { Picker } from '../components/Picker';
import { copyToClipboard } from '../utils';
import { useCheckCoverageMutation, useGenerateLomnMutation } from '../generated/graphql';

const TEST_OPTIONS = [
  { value: 'comprehensive_genomic_profiling', label: 'Comprehensive Genomic Profiling (CGP)' },
  { value: 'liquid_biopsy', label: 'Liquid Biopsy' },
  { value: 'targeted_panel', label: 'Targeted Panel' },
  { value: 'rna_sequencing', label: 'RNA Sequencing' },
  { value: 'whole_exome_sequencing', label: 'Whole Exome Sequencing' },
];

const INSURER_OPTIONS = [
  { value: '', label: 'Use my profile insurance' },
  { value: 'Medicare', label: 'Medicare' },
  { value: 'UnitedHealthcare', label: 'UnitedHealthcare' },
  { value: 'Aetna', label: 'Aetna' },
  { value: 'Cigna', label: 'Cigna' },
  { value: 'BCBS', label: 'Blue Cross Blue Shield' },
  { value: 'Humana', label: 'Humana' },
  { value: 'Medicaid', label: 'Medicaid' },
];

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  covered: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: 'Covered' },
  likely_covered: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', label: 'Likely Covered' },
  prior_auth_required: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', label: 'Prior Auth Required' },
  not_covered: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: 'Not Covered' },
  unknown: { bg: '#F9FAFB', border: '#E5E7EB', text: '#374151', label: 'Unknown' },
};

export function InsuranceCoverageScreen() {
  const router = useRouter();
  const [testType, setTestType] = useState('comprehensive_genomic_profiling');
  const [insurer, setInsurer] = useState('');
  const [coverage, setCoverage] = useState<any>(null);
  const [lomn, setLomn] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lomnLoading, setLomnLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [checkCoverageMutation] = useCheckCoverageMutation();
  const [generateLomnMutation] = useGenerateLomnMutation();

  const checkCoverage = async () => {
    setLoading(true);
    setError(null);
    setCoverage(null);
    setLomn(null);
    try {
      const { data } = await checkCoverageMutation({
        variables: { insurer: insurer || 'generic', testType },
      });
      setCoverage(data?.checkInsuranceCoverage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const generateLomn = async () => {
    if (!coverage) return;
    setLomnLoading(true);
    try {
      const { data } = await generateLomnMutation({
        variables: { testType, insurer: insurer || undefined },
      });
      setLomn(data?.generateLOMN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate letter');
    } finally {
      setLomnLoading(false);
    }
  };

  const statusStyle = coverage ? STATUS_STYLES[coverage.status] ?? STATUS_STYLES.unknown : null;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Pressable onPress={() => router.push('/sequencing')}>
          <Text sx={{ mb: '$6', fontSize: 14, color: '$mutedForeground' }}>{'\u2190'} Back to sequencing</Text>
        </Pressable>

        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Insurance Coverage Checker</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Check whether your insurance covers genomic sequencing for your cancer type.
        </Text>

        {/* Form */}
        <View sx={{ mt: '$8', gap: '$4' }}>
          <View>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Test type</Text>
            <View sx={{ mt: '$1' }}>
              <Picker
                value={testType}
                onValueChange={setTestType}
                options={TEST_OPTIONS}
              />
            </View>
          </View>

          <View>
            <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Insurance provider</Text>
            <View sx={{ mt: '$1' }}>
              <Picker
                value={insurer}
                onValueChange={setInsurer}
                options={INSURER_OPTIONS}
              />
            </View>
          </View>

          <Pressable onPress={checkCoverage} disabled={loading}>
            <View sx={{
              backgroundColor: loading ? '#D1D5DB' : 'blue600',
              borderRadius: 8, px: '$6', py: '$3', alignItems: 'center',
            }}>
              {loading ? (
                <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                  <ActivityIndicator size="small" color="white" />
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Checking...</Text>
                </View>
              ) : (
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Check Coverage</Text>
              )}
            </View>
          </Pressable>
        </View>

        {error && (
          <View sx={{ mt: '$6', borderRadius: 8, borderWidth: 1, borderColor: '#FECACA', backgroundColor: '#FEF2F2', p: '$4' }}>
            <Text sx={{ fontSize: 14, color: '#991B1B' }}>{error}</Text>
          </View>
        )}

        {/* Results */}
        {coverage && statusStyle && (
          <View sx={{ mt: '$8', gap: '$4' }}>
            {/* Status card */}
            <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: statusStyle.border, backgroundColor: statusStyle.bg, p: '$6' }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                <View sx={{ borderRadius: 4, px: '$2', py: '$1', backgroundColor: 'rgba(255,255,255,0.5)' }}>
                  <Text sx={{ fontSize: 12, fontWeight: '600', color: statusStyle.text }}>{statusStyle.label}</Text>
                </View>
                <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{coverage.insurer}</Text>
              </View>
              <Text sx={{ mt: '$3', color: statusStyle.text, lineHeight: 24 }}>{coverage.reasoning}</Text>
            </View>

            {/* Conditions */}
            {coverage.conditions?.length > 0 && (
              <View>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>Requirements</Text>
                <View sx={{ mt: '$2', gap: '$1' }}>
                  {coverage.conditions.map((c: string, i: number) => (
                    <View key={i} sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$2' }}>
                      <View sx={{ mt: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#9CA3AF', flexShrink: 0 }} />
                      <Text sx={{ fontSize: 14, color: '$mutedForeground', flex: 1 }}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* CPT Codes */}
            {coverage.cptCodes?.length > 0 && (
              <View>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>CPT Codes</Text>
                <View sx={{ mt: '$1', flexDirection: 'row', gap: '$2' }}>
                  {coverage.cptCodes.map((code: string) => (
                    <View key={code} sx={{ borderRadius: 4, backgroundColor: '#F3F4F6', px: '$2', py: '$1' }}>
                      <Text sx={{ fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>{code}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Missing info */}
            {coverage.missingInfo?.length > 0 && (
              <View sx={{ borderRadius: 8, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#78350F' }}>Missing information</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#92400E' }}>
                  Add the following to your profile for a more accurate coverage check: {coverage.missingInfo.join(', ')}
                </Text>
              </View>
            )}

            {/* LOMN generation */}
            {(coverage.priorAuthRequired || coverage.status === 'not_covered') && (
              <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#C7D2FE', backgroundColor: '#EEF2FF', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '#312E81' }}>Letter of Medical Necessity</Text>
                <Text sx={{ mt: '$1', fontSize: 14, color: '#3730A3' }}>
                  {coverage.priorAuthRequired
                    ? 'Prior authorization is required. Generate a letter of medical necessity to support the request.'
                    : 'This test may not be covered, but a letter of medical necessity can support an appeal.'}
                </Text>
                {!lomn && (
                  <Pressable onPress={generateLomn} disabled={lomnLoading}>
                    <View sx={{
                      mt: '$3',
                      backgroundColor: lomnLoading ? '#D1D5DB' : '#4F46E5',
                      borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start',
                    }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: 'white' }}>
                        {lomnLoading ? 'Generating...' : 'Generate LOMN'}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>
            )}

            {/* LOMN content */}
            {lomn && (
              <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', p: '$4' }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: '$3' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>Letter of Medical Necessity</Text>
                  <Pressable onPress={() => copyToClipboard(lomn.content)}>
                    <View sx={{ borderRadius: 4, borderWidth: 1, borderColor: '$border', px: '$2', py: '$1' }}>
                      <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>Copy</Text>
                    </View>
                  </Pressable>
                </View>
                <Text sx={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>{lomn.content}</Text>
                <View sx={{ mt: '$3', flexDirection: 'row', gap: '$2' }}>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>CPT: {lomn.cptCodes?.join(', ')}</Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>{'\u00B7'}</Text>
                  <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>ICD-10: {lomn.icdCodes?.join(', ')}</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
