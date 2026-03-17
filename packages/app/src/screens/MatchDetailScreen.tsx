import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { EligibilityBreakdown } from '../components';
import { openExternalUrl } from '../utils';
import type { MatchBreakdownItem } from '@oncovax/shared';
import { useGetMatchQuery } from '../generated/graphql';

interface TrialSite {
  facility?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export function MatchDetailScreen({ trialId }: { trialId: string }) {
  const { data, loading, error } = useGetMatchQuery({ variables: { id: trialId } });
  const match = data?.match;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: '$mutedForeground' }}>Loading trial details...</Text>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Match not found'}</Text>
        <Link href="/matches">
          <Text sx={{ color: 'blue600', mt: '$4' }}>Back to matches</Text>
        </Link>
      </View>
    );
  }

  const trial = match.trial;
  const breakdownItems = (match.matchBreakdown ?? []) as MatchBreakdownItem[];
  const llmAssessment = match.llmAssessment
    ? {
        ...match.llmAssessment,
        overallAssessment: match.llmAssessment.overallAssessment as 'likely_eligible' | 'possibly_eligible' | 'likely_ineligible',
      }
    : undefined;
  const sites = (trial?.locations ?? []) as TrialSite[];

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        {/* Back link */}
        <Link href="/matches">
          <Text sx={{ fontSize: '$sm', color: 'gray500', mb: '$6' }}>&larr; Back to matches</Text>
        </Link>

        {/* Title section */}
        <View sx={{ mb: '$8' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12, mb: '$2', flexWrap: 'wrap' }}>
            <Text sx={{ fontSize: '$sm', color: 'gray500' }}>{trial?.nctId}</Text>
            {trial?.phase && (
              <View sx={{ bg: 'gray100', borderRadius: 9999, px: '$2', py: 2 }}>
                <Text sx={{ fontSize: 11, color: 'gray600' }}>{trial.phase}</Text>
              </View>
            )}
            <View sx={{ bg: 'blue50', borderRadius: 9999, px: '$2', py: 2 }}>
              <Text sx={{ fontSize: 11, color: 'blue600' }}>
                {trial?.status?.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>
            {trial?.title}
          </Text>
          {trial?.sponsor && (
            <Text sx={{ color: 'gray500', mt: '$1' }}>Sponsored by {trial.sponsor}</Text>
          )}
        </View>

        {/* Eligibility Breakdown */}
        <View sx={{ mb: '$8', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
          <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900', mb: '$4' }}>
            Eligibility Breakdown
          </Text>
          <EligibilityBreakdown
            items={breakdownItems}
            llmAssessment={llmAssessment}
            potentialBlockers={match.potentialBlockers ?? []}
            matchScore={match.matchScore}
          />
        </View>

        {/* Interventions */}
        {trial?.interventions && trial.interventions.length > 0 && (
          <View sx={{ mb: '$8', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
            <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900', mb: '$3' }}>
              Interventions
            </Text>
            {trial.interventions.map((intervention, i) => (
              <Text key={i} sx={{ fontSize: '$sm', color: 'gray700', mb: '$1' }}>
                {intervention}
              </Text>
            ))}
          </View>
        )}

        {/* Summary */}
        {trial?.briefSummary && (
          <View sx={{ mb: '$8', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
            <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900', mb: '$3' }}>
              Trial Summary
            </Text>
            <Text sx={{ fontSize: '$sm', color: 'gray600' }}>{trial.briefSummary}</Text>
          </View>
        )}

        {/* Full Eligibility Criteria */}
        {trial?.eligibilityCriteria && (
          <View sx={{ mb: '$8', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
            <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900', mb: '$3' }}>
              Full Eligibility Criteria
            </Text>
            <Text sx={{ fontSize: '$sm', color: 'gray600' }}>{trial.eligibilityCriteria}</Text>
          </View>
        )}

        {/* Sites */}
        {sites.length > 0 && (
          <View sx={{ mb: '$8', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
            <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900', mb: '$3' }}>
              Trial Sites ({sites.length})
            </Text>
            {sites.map((site, i) => (
              <View key={i} sx={{ py: '$3', borderTopWidth: i > 0 ? 1 : 0, borderColor: 'gray100' }}>
                {site.facility && (
                  <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>{site.facility}</Text>
                )}
                <Text sx={{ fontSize: '$sm', color: 'gray500' }}>
                  {[site.city, site.state, site.country].filter(Boolean).join(', ')}
                </Text>
                {(site.contactName || site.contactEmail || site.contactPhone) && (
                  <Text sx={{ fontSize: 11, color: 'gray400', mt: '$1' }}>
                    {[site.contactName, site.contactEmail, site.contactPhone].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View sx={{ flexDirection: 'row', gap: 12, mt: '$8', flexWrap: 'wrap' }}>
          <Link href={`/matches/${trialId}/contact`}>
            <View sx={{ bg: 'gray900', borderRadius: '$lg', px: '$6', py: '$3' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>
                Generate oncologist brief
              </Text>
            </View>
          </Link>
          <Pressable
            onPress={() =>
              openExternalUrl(`https://clinicaltrials.gov/study/${trial?.nctId}`)
            }
          >
            <View sx={{ borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$6', py: '$3' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
                View on ClinicalTrials.gov
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
