import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetGenomicResultQuery, useConfirmGenomicsMutation } from '../generated/graphql';

function significanceBadge(sig: string): { bg: string; fg: string } {
  const lower = sig.toLowerCase();
  if (lower === 'pathogenic') return { bg: '#FEE2E2', fg: '#991B1B' };
  if (lower === 'likely pathogenic') return { bg: '#FFEDD5', fg: '#9A3412' };
  if (lower === 'vus') return { bg: '#FEF9C3', fg: '#854D0E' };
  return { bg: '#F3F4F6', fg: '#4B5563' };
}

function confidenceBadge(confidence: number): { bg: string; fg: string; label: string } {
  if (confidence >= 0.9) return { bg: '#DCFCE7', fg: '#166534', label: 'High confidence' };
  if (confidence >= 0.7) return { bg: '#FEF9C3', fg: '#854D0E', label: 'Medium confidence' };
  return { bg: '#FEE2E2', fg: '#991B1B', label: 'Low confidence' };
}

function biomarkerStatusColor(status: string): { bg: string; fg: string } {
  const lower = status.toLowerCase();
  if (lower === 'high' || lower === 'msi-h' || lower.includes('positive')) return { bg: '#DBEAFE', fg: '#1E40AF' };
  if (lower === 'low' || lower === 'mss' || lower.includes('stable')) return { bg: '#F3F4F6', fg: '#4B5563' };
  return { bg: '#FEF9C3', fg: '#854D0E' };
}

export function GenomicConfirmScreen({ resultId }: { resultId: string | null }) {
  const skip = !resultId;
  const { data, loading, error: queryError } = useGetGenomicResultQuery({
    variables: { id: resultId ?? '' },
    skip,
  });
  const [confirmGenomics, { loading: confirming }] = useConfirmGenomicsMutation();

  const result = data?.genomicResult;
  const alterations = result?.alterations ?? [];
  const biomarkers = result?.biomarkers;

  const handleConfirm = async () => {
    if (!resultId) return;
    await confirmGenomics({ variables: { genomicResultId: resultId } });
    // Navigation handled by web wrapper or mobile navigator
  };

  if (!resultId) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Something went wrong</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '#DC2626' }}>No result ID provided</Text>
        <Link href="/sequencing/upload">
          <View sx={{ mt: '$4', bg: '#2563EB', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
            <Text sx={{ color: 'white', fontSize: 14 }}>Try uploading again</Text>
          </View>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading results...</Text>
      </View>
    );
  }

  if (queryError || !result) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Something went wrong</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '#DC2626' }}>{queryError?.message ?? 'Result not found'}</Text>
        <Link href="/sequencing/upload">
          <View sx={{ mt: '$4', bg: '#2563EB', borderRadius: 8, px: '$4', py: '$2', alignSelf: 'flex-start' }}>
            <Text sx={{ color: 'white', fontSize: 14 }}>Try uploading again</Text>
          </View>
        </Link>
      </View>
    );
  }

  const interpretation = result.interpretation as Record<string, any> | null;
  const extractionConfidence = (interpretation as any)?.extractionConfidence ?? 0.85;
  const confBadge = confidenceBadge(extractionConfidence);
  const germlineFindings = (interpretation as any)?.germlineFindings as Array<{ gene: string; variant: string; significance: string }> | null;

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/sequencing/upload">
          <Text sx={{ fontSize: 13, color: 'gray500', mb: '$6' }}>{'<'} Upload a different report</Text>
        </Link>

        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Review your genomic report</Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500' }}>
              We extracted the following from your {result.provider} {result.testName} report. Please review and confirm.
            </Text>
          </View>
          <View sx={{ bg: confBadge.bg, borderRadius: 12, px: '$3', py: '$1', ml: '$3' }}>
            <Text sx={{ fontSize: 12, fontWeight: '500', color: confBadge.fg }}>{confBadge.label}</Text>
          </View>
        </View>

        {/* Mutations */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: 'gray900' }}>
            Genomic alterations ({alterations.length})
          </Text>
          <View sx={{ mt: '$3', gap: '$3' }}>
            {alterations.map((alt, i) => {
              const sigBadge = significanceBadge(alt.clinicalSignificance);
              return (
                <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', flexWrap: 'wrap' }}>
                    <View sx={{ bg: '#111827', borderRadius: 4, px: 8, py: 2 }}>
                      <Text sx={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{alt.gene}</Text>
                    </View>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>{alt.alteration}</Text>
                    <View sx={{ bg: sigBadge.bg, borderRadius: 12, px: 8, py: 2 }}>
                      <Text sx={{ fontSize: 12, fontWeight: '500', color: sigBadge.fg }}>{alt.clinicalSignificance}</Text>
                    </View>
                    {alt.confidence < 0.8 && (
                      <View sx={{ bg: '#FEF9C3', borderRadius: 12, px: 8, py: 2 }}>
                        <Text sx={{ fontSize: 12, color: '#854D0E' }}>Needs review</Text>
                      </View>
                    )}
                  </View>
                  <Text sx={{ mt: '$1', fontSize: 12, color: 'gray500' }}>
                    Type: {alt.alterationType.replace(/_/g, ' ')}
                    {alt.variantAlleleFrequency != null && ` | VAF: ${(alt.variantAlleleFrequency * 100).toFixed(1)}%`}
                  </Text>
                  {alt.therapyImplications.approvedTherapies.length > 0 && (
                    <Text sx={{ mt: '$1', fontSize: 12, color: '#15803D' }}>
                      Approved therapies: {alt.therapyImplications.approvedTherapies.join(', ')}
                    </Text>
                  )}
                </View>
              );
            })}
            {alterations.length === 0 && (
              <Text sx={{ fontSize: 14, color: 'gray500', fontStyle: 'italic' }}>No genomic alterations detected</Text>
            )}
          </View>
        </View>

        {/* Biomarkers */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: 'gray900' }}>Biomarkers</Text>
          <View sx={{ mt: '$3', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
            {biomarkers?.tmb && (
              <View sx={{ flex: 1, minWidth: 200, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>TMB</Text>
                  <View sx={{ bg: biomarkerStatusColor(biomarkers.tmb.status).bg, borderRadius: 12, px: 8, py: 2 }}>
                    <Text sx={{ fontSize: 12, fontWeight: '500', color: biomarkerStatusColor(biomarkers.tmb.status).fg }}>{biomarkers.tmb.status}</Text>
                  </View>
                </View>
                <Text sx={{ mt: '$1', fontSize: 18, fontWeight: '600', color: 'gray900' }}>
                  {biomarkers.tmb.value} {biomarkers.tmb.unit}
                </Text>
              </View>
            )}
            {biomarkers?.msi && (
              <View sx={{ flex: 1, minWidth: 200, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>MSI</Text>
                  <View sx={{ bg: biomarkerStatusColor(biomarkers.msi.status).bg, borderRadius: 12, px: 8, py: 2 }}>
                    <Text sx={{ fontSize: 12, fontWeight: '500', color: biomarkerStatusColor(biomarkers.msi.status).fg }}>{biomarkers.msi.status}</Text>
                  </View>
                </View>
                {biomarkers.msi.score != null && (
                  <Text sx={{ mt: '$1', fontSize: 18, fontWeight: '600', color: 'gray900' }}>Score: {biomarkers.msi.score}</Text>
                )}
              </View>
            )}
            {biomarkers?.pdl1 && (
              <View sx={{ flex: 1, minWidth: 200, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>PD-L1</Text>
                {biomarkers.pdl1.tps != null && (
                  <Text sx={{ mt: '$1', fontSize: 14, color: 'gray900' }}>TPS: {biomarkers.pdl1.tps}%</Text>
                )}
                {biomarkers.pdl1.cps != null && (
                  <Text sx={{ fontSize: 14, color: 'gray900' }}>CPS: {biomarkers.pdl1.cps}</Text>
                )}
              </View>
            )}
            {biomarkers?.hrd && (
              <View sx={{ flex: 1, minWidth: 200, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                <View sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray700' }}>HRD</Text>
                  <View sx={{ bg: biomarkerStatusColor(biomarkers.hrd.status).bg, borderRadius: 12, px: 8, py: 2 }}>
                    <Text sx={{ fontSize: 12, fontWeight: '500', color: biomarkerStatusColor(biomarkers.hrd.status).fg }}>{biomarkers.hrd.status}</Text>
                  </View>
                </View>
                {biomarkers.hrd.score != null && (
                  <Text sx={{ mt: '$1', fontSize: 18, fontWeight: '600', color: 'gray900' }}>Score: {biomarkers.hrd.score}</Text>
                )}
              </View>
            )}
          </View>
          {!biomarkers?.tmb && !biomarkers?.msi && !biomarkers?.pdl1 && !biomarkers?.hrd && (
            <Text sx={{ mt: '$3', fontSize: 14, color: 'gray500', fontStyle: 'italic' }}>No biomarkers reported</Text>
          )}
        </View>

        {/* Germline findings */}
        {germlineFindings && germlineFindings.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: 'gray900' }}>Germline findings</Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: 'gray500' }}>These are hereditary changes found in your DNA.</Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {germlineFindings.map((gf, i) => (
                <View key={i} sx={{ borderRadius: 8, borderWidth: 1, borderColor: '#DDD6FE', bg: '#F5F3FF', p: '$3' }}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                    <View sx={{ bg: '#581C87', borderRadius: 4, px: 8, py: 2 }}>
                      <Text sx={{ fontSize: 12, fontWeight: '700', color: 'white' }}>{gf.gene}</Text>
                    </View>
                    <Text sx={{ fontSize: 14, color: '#581C87' }}>{gf.variant}</Text>
                    <Text sx={{ fontSize: 12, color: '#7C3AED' }}>({gf.significance})</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirm button */}
        <View sx={{ mt: '$10', borderRadius: 12, bg: '#EFF6FF', p: '$6' }}>
          <Text sx={{ fontWeight: '600', color: '#1E3A8A' }}>Does this look right?</Text>
          <Text sx={{ mt: '$1', fontSize: 14, color: '#1E40AF' }}>
            Confirming will update your profile with this genomic data and improve your trial matching.
          </Text>
          <View sx={{ mt: '$4', flexDirection: 'row', gap: '$3' }}>
            <Pressable onPress={handleConfirm} disabled={confirming}>
              <View sx={{ bg: '#2563EB', borderRadius: 8, px: '$6', py: 10, opacity: confirming ? 0.5 : 1 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                  {confirming ? 'Updating your profile...' : 'Looks right — update my matches'}
                </Text>
              </View>
            </Pressable>
            <Link href="/sequencing/upload">
              <View sx={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, px: '$4', py: 10 }}>
                <Text sx={{ fontSize: 14, color: 'gray700' }}>Upload a different report</Text>
              </View>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
