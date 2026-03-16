import { View, Text, Pressable } from 'dripsy';
import { Link } from 'solito/link';
import { Linking } from 'react-native';

interface FinancialProgramCardProps {
  programId: string;
  name: string;
  organization: string;
  type: string;
  matchStatus: string;
  estimatedBenefit: string | null;
  matchReasoning: string;
  programStatus: string;
  applicationUrl: string | null;
  website: string;
  onSubscribe?: (programId: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  open: { label: 'Open', bg: 'green100', text: 'green700' },
  closed: { label: 'Closed', bg: 'red100', text: 'red700' },
  waitlist: { label: 'Waitlist', bg: 'amber100', text: 'amber700' },
  unknown: { label: 'Check status', bg: 'gray100', text: 'gray600' },
};

const MATCH_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  eligible: { label: 'Eligible', bg: 'green100', text: 'green700' },
  likely_eligible: { label: 'Likely eligible', bg: 'blue100', text: 'blue700' },
  check_eligibility: { label: 'Check eligibility', bg: 'amber100', text: 'amber700' },
};

const TYPE_LABELS: Record<string, string> = {
  copay_foundation: 'Copay Foundation',
  pharma_pap: 'Drug Manufacturer',
  nonprofit_grant: 'Nonprofit Grant',
  government_program: 'Government Program',
  lodging_program: 'Lodging',
  transportation_program: 'Transportation',
  general_assistance: 'General Assistance',
};

export function FinancialProgramCard({
  programId,
  name,
  organization,
  type,
  matchStatus,
  estimatedBenefit,
  matchReasoning,
  programStatus,
  applicationUrl,
  website,
  onSubscribe,
}: FinancialProgramCardProps) {
  const statusBadge = STATUS_BADGE[programStatus] ?? STATUS_BADGE.unknown;
  const matchBadge = MATCH_BADGE[matchStatus] ?? MATCH_BADGE.check_eligibility;

  return (
    <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', p: '$4' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '$2' }}>
        <View sx={{ flex: 1 }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
            <Link href={`/financial/${programId}`}>
              <Text sx={{ fontWeight: '600', color: 'gray900' }}>{name}</Text>
            </Link>
            <View sx={{ borderRadius: '$sm', bg: statusBadge.bg, px: 6, py: 2 }}>
              <Text sx={{ fontSize: 10, fontWeight: '500', color: statusBadge.text }}>
                {statusBadge.label}
              </Text>
            </View>
            <View sx={{ borderRadius: '$sm', bg: matchBadge.bg, px: 6, py: 2 }}>
              <Text sx={{ fontSize: 10, fontWeight: '500', color: matchBadge.text }}>
                {matchBadge.label}
              </Text>
            </View>
          </View>
          <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
            {organization} {'\u00B7'} {TYPE_LABELS[type] ?? type}
          </Text>
        </View>
        {estimatedBenefit && (
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'green700' }}>
            {estimatedBenefit}
          </Text>
        )}
      </View>

      <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>{matchReasoning}</Text>

      <View sx={{ mt: '$3', flexDirection: 'row', gap: '$2' }}>
        {programStatus === 'open' || programStatus === 'unknown' ? (
          <Pressable
            onPress={() => Linking.openURL(applicationUrl ?? website)}
            sx={{ borderRadius: '$lg', bg: 'blue600', px: '$3', py: 6 }}
          >
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>
              {applicationUrl ? 'Apply now' : 'Visit website'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onSubscribe?.(programId)}
            sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray300', px: '$3', py: 6 }}
          >
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>
              Get notified when open
            </Text>
          </Pressable>
        )}
        <Link href={`/financial/${programId}`}>
          <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray300', px: '$3', py: 6 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>Details</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}
