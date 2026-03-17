import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Alert, Platform } from 'react-native';
import { Link } from 'solito/link';
import { openExternalUrl } from '../utils';
import {
  useGetFinancialProgramQuery,
  useGetFinancialMatchesQuery,
  useSubscribeFinancialProgramMutation,
} from '../generated/graphql';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  eligible: { bg: 'green100', text: 'green800', border: 'green200' },
  likely_eligible: { bg: 'blue100', text: 'blue800', border: 'blue200' },
  check_eligibility: { bg: 'amber100', text: 'amber800', border: 'amber200' },
};

const STATUS_LABELS: Record<string, string> = {
  eligible: 'You appear eligible',
  likely_eligible: 'You are likely eligible',
  check_eligibility: 'Check your eligibility',
};

export function FinancialProgramScreen({ programId }: { programId: string }) {
  const { data, loading, error } = useGetFinancialProgramQuery({
    variables: { programId },
  });
  const { data: matchesData } = useGetFinancialMatchesQuery();
  const [subscribe] = useSubscribeFinancialProgramMutation();

  const program = data?.financialProgram;
  const match = matchesData?.financialMatches?.find((m) => m.programId === programId);

  const handleSubscribe = async () => {
    try {
      await subscribe({ variables: { programId } });
      const msg = 'You will be notified when this fund reopens.';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Subscribed', msg);
      }
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !program) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Program not found'}</Text>
        <Link href="/financial">
          <Text sx={{ mt: '$4', fontSize: '$sm', color: 'blue600' }}>Back to financial assistance</Text>
        </Link>
      </View>
    );
  }

  const colors = match ? STATUS_COLORS[match.matchStatus] : null;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/financial">
          <Text sx={{ mb: '$6', fontSize: '$sm', color: 'gray500' }}>&larr; Back to all programs</Text>
        </Link>

        <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>{program.name}</Text>
        <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>{program.organization}</Text>

        {/* Match status banner */}
        {match && colors && (
          <View sx={{ mt: '$4', borderRadius: '$lg', borderWidth: 1, borderColor: colors.border, bg: colors.bg, p: '$4' }}>
            <Text sx={{ fontWeight: '600', color: colors.text }}>
              {STATUS_LABELS[match.matchStatus] ?? match.matchStatus}
            </Text>
            {match.matchReasoning && (
              <Text sx={{ mt: '$1', fontSize: '$sm', color: colors.text }}>{match.matchReasoning}</Text>
            )}
            {match.estimatedBenefit && (
              <Text sx={{ mt: '$1', fontSize: '$sm', fontWeight: '500', color: colors.text }}>
                Estimated benefit: {match.estimatedBenefit}
              </Text>
            )}
          </View>
        )}

        {/* Description */}
        {program.description && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>
              About this program
            </Text>
            <Text sx={{ mt: '$2', color: 'gray700' }}>{program.description}</Text>
          </View>
        )}

        {/* Benefit */}
        {program.benefitDescription && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>
              What you get
            </Text>
            <Text sx={{ mt: '$2', color: 'gray700' }}>{program.benefitDescription}</Text>
            {program.maxBenefitAmount && (
              <Text sx={{ mt: '$1', fontSize: '$lg', fontWeight: '600', color: 'green700' }}>
                Up to ${program.maxBenefitAmount.toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* Assistance categories */}
        {program.assistanceCategories.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>
              Assistance categories
            </Text>
            <View sx={{ flexDirection: 'row', gap: 8, mt: '$2', flexWrap: 'wrap' }}>
              {program.assistanceCategories.map((cat) => (
                <View key={cat} sx={{ bg: 'gray100', borderRadius: 9999, px: '$3', py: '$1' }}>
                  <Text sx={{ fontSize: '$sm', color: 'gray700' }}>
                    {cat.replace(/_/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: '$sm', fontWeight: '600', textTransform: 'uppercase', color: 'gray500' }}>
            Contact
          </Text>
          <Pressable onPress={() => openExternalUrl(program.website)} sx={{ mt: '$2' }}>
            <Text sx={{ fontSize: '$sm', color: 'blue600' }}>Website: {program.website}</Text>
          </Pressable>
        </View>

        {/* Action buttons */}
        <View sx={{ mt: '$8', flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          {program.applicationUrl ? (
            <Pressable onPress={() => openExternalUrl(program.applicationUrl!)} sx={{ flex: 1 }}>
              <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>Apply now</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable onPress={() => openExternalUrl(program.website)} sx={{ flex: 1 }}>
              <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
                  Visit website to apply
                </Text>
              </View>
            </Pressable>
          )}
          <Pressable onPress={handleSubscribe}>
            <View sx={{ borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$6', py: '$3' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'gray700' }}>
                Notify me when fund reopens
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
