import { View, Text, Pressable } from 'dripsy';
import { Link } from 'solito/link';
import type { MatchBreakdownItem } from '@iish/shared';

interface MatchCardProps {
  matchId: string;
  trialId: string;
  nctId: string;
  title: string;
  phase: string | null;
  sponsor: string | null;
  interventionName: string | null;
  matchScore: number;
  matchBreakdown: { items?: MatchBreakdownItem[] } | null;
  potentialBlockers: string[];
  status: string;
  onStatusChange?: (matchId: string, status: string) => void;
}

function scoreColor(score: number): { text: string; bg: string; border: string } {
  if (score >= 70) return { text: 'green700', bg: 'green50', border: 'green200' };
  if (score >= 40) return { text: 'yellow700', bg: 'yellow50', border: 'yellow200' };
  return { text: 'red700', bg: 'red50', border: 'red200' };
}

function statusBadge(status: string): { label: string; bg: string; text: string } {
  switch (status) {
    case 'saved':
      return { label: 'Saved', bg: 'blue100', text: 'blue700' };
    case 'contacted':
      return { label: 'Contacted', bg: 'purple100', text: 'purple700' };
    case 'applied':
      return { label: 'Applied', bg: 'green100', text: 'green700' };
    case 'dismissed':
      return { label: 'Dismissed', bg: 'gray100', text: 'gray500' };
    default:
      return { label: 'New', bg: 'gray100', text: 'gray700' };
  }
}

function BreakdownPills({ items }: { items: MatchBreakdownItem[] }) {
  const categoryLabels: Record<string, string> = {
    cancerType: 'Cancer Type',
    stage: 'Stage',
    biomarkers: 'Biomarkers',
    priorTreatments: 'Treatments',
    ecog: 'ECOG',
    age: 'Age',
  };

  return (
    <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, mt: '$3' }}>
      {items.map((item) => {
        const pillColors =
          item.status === 'match'
            ? { bg: 'green100', text: 'green800' }
            : item.status === 'mismatch'
              ? { bg: 'red100', text: 'red800' }
              : { bg: 'gray100', text: 'gray600' };
        return (
          <View key={item.category} sx={{ borderRadius: '$full', bg: pillColors.bg, px: '$2', py: 2 }}>
            <Text sx={{ fontSize: '$xs', color: pillColors.text }}>
              {categoryLabels[item.category] ?? item.category}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function MatchCard({
  matchId,
  nctId,
  title,
  phase,
  sponsor,
  interventionName,
  matchScore,
  matchBreakdown,
  potentialBlockers,
  status,
  onStatusChange,
}: MatchCardProps) {
  const badge = statusBadge(status);
  const items = matchBreakdown?.items ?? [];
  const colors = scoreColor(matchScore);

  return (
    <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '$4' }}>
        <View sx={{ flex: 1 }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', mb: '$1' }}>
            <View sx={{ borderRadius: '$full', bg: badge.bg, px: '$2', py: 2 }}>
              <Text sx={{ fontSize: '$xs', color: badge.text }}>{badge.label}</Text>
            </View>
            {phase && <Text sx={{ fontSize: '$xs', color: 'gray500' }}>{phase}</Text>}
          </View>

          <Link href={`/matches/${matchId}`}>
            <Text numberOfLines={2} sx={{ fontSize: '$base', fontWeight: '600', color: 'gray900' }}>
              {title}
            </Text>
          </Link>

          <Text sx={{ fontSize: '$sm', color: 'gray500', mt: '$1' }}>
            {nctId}
            {sponsor && ` \u00B7 ${sponsor}`}
          </Text>

          {interventionName && (
            <Text sx={{ fontSize: '$sm', color: 'gray700', mt: '$1' }}>{interventionName}</Text>
          )}

          {items.length > 0 && <BreakdownPills items={items} />}

          {potentialBlockers.length > 0 && (
            <View sx={{ mt: '$3' }}>
              <Text sx={{ fontSize: '$xs', color: 'red600' }}>
                <Text sx={{ fontWeight: '500' }}>Potential concern: </Text>
                {potentialBlockers[0]}
                {potentialBlockers.length > 1 && (
                  <Text sx={{ color: 'gray500' }}>
                    {' '}(+{potentialBlockers.length - 1} more)
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>

        <View
          sx={{
            width: 64,
            height: 64,
            borderRadius: '$xl',
            borderWidth: 1,
            borderColor: colors.border,
            bg: colors.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text sx={{ fontSize: '$xl', fontWeight: '700', color: colors.text }}>
            {Math.round(matchScore)}
          </Text>
          <Text sx={{ fontSize: 10, opacity: 0.6, color: colors.text }}>/ 100</Text>
        </View>
      </View>

      <View
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '$2',
          mt: '$4',
          pt: '$3',
          borderTopWidth: 1,
          borderColor: 'gray100',
        }}
      >
        <Link href={`/matches/${matchId}`}>
          <Text sx={{ fontSize: '$sm', color: 'blue600', fontWeight: '500' }}>View details</Text>
        </Link>
        <Text sx={{ color: 'gray300' }}>{'\u00B7'}</Text>
        <Link href={`/matches/${matchId}/contact`}>
          <Text sx={{ fontSize: '$sm', color: 'blue600', fontWeight: '500' }}>Oncologist brief</Text>
        </Link>
        {status !== 'saved' && status !== 'dismissed' && onStatusChange && (
          <>
            <Text sx={{ color: 'gray300' }}>{'\u00B7'}</Text>
            <Pressable onPress={() => onStatusChange(matchId, 'saved')}>
              <Text sx={{ fontSize: '$sm', color: 'gray500' }}>Save</Text>
            </Pressable>
            <Pressable onPress={() => onStatusChange(matchId, 'dismissed')}>
              <Text sx={{ fontSize: '$sm', color: 'gray400' }}>Dismiss</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
