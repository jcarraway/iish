import { useMemo } from 'react';
import { View, Text, Pressable } from 'dripsy';
import { ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'solito/router';
import { FinancialProgramCard } from '../components';
import { useGetFinancialMatchesQuery, useSubscribeFinancialProgramMutation } from '../generated/graphql';

const CATEGORY_LABELS: Record<string, string> = {
  copay_treatment: 'Treatment Copay Help',
  copay_diagnostics: 'Diagnostic Test Coverage',
  free_medication: 'Free Medication Programs',
  transportation: 'Transportation Assistance',
  lodging: 'Lodging & Housing',
  living_expenses: 'Living Expenses',
  food: 'Food & Nutrition',
  childcare: 'Childcare',
  general_financial: 'General Financial Assistance',
  fertility_preservation: 'Fertility Preservation',
  mental_health: 'Mental Health Support',
};

export function FinancialScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useGetFinancialMatchesQuery();
  const [subscribeMutation] = useSubscribeFinancialProgramMutation();

  const matches = data?.financialMatches ?? [];

  const { grouped, totalEstimated, eligibleCount } = useMemo(() => {
    const g: Record<string, typeof matches> = {};
    let total = 0;
    let eligible = 0;

    for (const m of matches) {
      if (m.estimatedBenefit) {
        const num = parseFloat(m.estimatedBenefit.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) total += num;
      }
      if (m.matchStatus === 'eligible' || m.matchStatus === 'likely_eligible') {
        eligible++;
      }
      for (const cat of m.assistanceCategories) {
        if (!g[cat]) g[cat] = [];
        g[cat].push(m);
      }
    }

    return { grouped: g, totalEstimated: total, eligibleCount: eligible };
  }, [matches]);

  const handleSubscribe = async (programId: string) => {
    try {
      await subscribeMutation({ variables: { programId } });
      Alert.alert('Subscribed', 'You will be notified when this fund reopens.');
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Financial Assistance</Text>
        <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray500' }}>Finding programs you may qualify for...</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Matching your profile to assistance programs...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Financial Assistance</Text>
        <Text sx={{ mt: '$4', fontSize: '$sm', color: 'red600' }}>{error.message}</Text>
        <Pressable
          onPress={() => refetch()}
          sx={{ mt: '$4', borderRadius: '$lg', bg: 'blue600', px: '$4', py: '$2', alignSelf: 'flex-start' }}
        >
          <Text sx={{ fontSize: '$sm', color: 'white' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: '$foreground' }}>Financial Assistance</Text>
        <View sx={{ mt: '$8', borderRadius: '$lg', borderWidth: 2, borderStyle: 'dashed', borderColor: 'gray300', p: '$8', alignItems: 'center' }}>
          <Text sx={{ color: 'gray600', textAlign: 'center' }}>Complete your profile to see financial assistance matches.</Text>
          <Pressable
            onPress={() => router.push('/start/confirm?path=manual')}
            sx={{ mt: '$4', borderRadius: '$lg', bg: 'blue600', px: '$4', py: '$2' }}
          >
            <Text sx={{ fontSize: '$sm', color: 'white' }}>Complete your profile</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
      {/* Hero banner */}
      <View sx={{ borderRadius: '$xl', bg: 'green50', borderWidth: 1, borderColor: 'green200', p: '$6', mb: '$8' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>Financial Assistance</Text>
        {totalEstimated > 0 && (
          <Text sx={{ mt: '$2', fontSize: '$lg', color: 'green800' }}>
            You may qualify for up to <Text sx={{ fontWeight: '700' }}>${totalEstimated.toLocaleString()}</Text> in financial assistance
          </Text>
        )}
        <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray600' }}>
          {eligibleCount} program{eligibleCount !== 1 ? 's' : ''} you appear eligible for {'\u00B7'} {matches.length} total matches
        </Text>
      </View>

      {/* Grouped results */}
      <View sx={{ gap: '$10' }}>
        {Object.entries(grouped)
          .sort(([, a], [, b]) => b.length - a.length)
          .map(([category, programs]) => (
            <View key={category}>
              <Text sx={{ mb: '$4', fontSize: '$lg', fontWeight: '700', color: 'gray900' }}>
                {CATEGORY_LABELS[category] ?? category}
                <Text sx={{ fontSize: '$sm', fontWeight: '400', color: 'gray500' }}> ({programs.length})</Text>
              </Text>
              <View sx={{ gap: '$3' }}>
                {programs.map((program) => (
                  <FinancialProgramCard
                    key={program.programId}
                    programId={program.programId}
                    name={program.programName}
                    organization={program.organization}
                    type={program.type}
                    matchStatus={program.matchStatus}
                    estimatedBenefit={program.estimatedBenefit ?? null}
                    matchReasoning={program.matchReasoning}
                    programStatus="unknown"
                    applicationUrl={program.applicationUrl ?? null}
                    website={program.website}
                    onSubscribe={handleSubscribe}
                  />
                ))}
              </View>
            </View>
          ))}
      </View>

      {/* CTAs */}
      <View sx={{ mt: '$10', flexDirection: ['column', 'row'], gap: '$3' }}>
        <Pressable
          onPress={() => router.push('/translate')}
          sx={{ flex: 1, borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}
        >
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray700' }}>View treatment guide</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/matches')}
          sx={{ flex: 1, borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}
        >
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray700' }}>View trial matches</Text>
        </Pressable>
      </View>
    </View>
  );
}
