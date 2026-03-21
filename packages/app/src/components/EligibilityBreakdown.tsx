import { View, Text } from 'dripsy';
import type { MatchBreakdownItem, LLMAssessment } from '@iish/shared';

interface EligibilityBreakdownProps {
  items: MatchBreakdownItem[];
  llmAssessment?: LLMAssessment;
  potentialBlockers: string[];
  matchScore: number;
}

const categoryLabels: Record<string, string> = {
  cancerType: 'Cancer Type',
  stage: 'Stage',
  biomarkers: 'Biomarkers',
  priorTreatments: 'Prior Treatments',
  ecog: 'ECOG Status',
  age: 'Age',
};

function StatusIcon({ status }: { status: 'match' | 'unknown' | 'mismatch' }) {
  if (status === 'match') {
    return <Text sx={{ color: 'green600', fontSize: '$lg' }}>{'\u2713'}</Text>;
  }
  if (status === 'mismatch') {
    return <Text sx={{ color: 'red600', fontSize: '$lg' }}>{'\u2717'}</Text>;
  }
  return <Text sx={{ color: 'yellow500', fontSize: '$lg' }}>?</Text>;
}

function ScoreBar({ score, weight }: { score: number; weight: number }) {
  const barColor = score >= 80 ? 'green500' : score >= 50 ? 'yellow500' : 'red400';

  return (
    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
      <View sx={{ width: 96, height: 8, bg: 'gray100', borderRadius: '$full', overflow: 'hidden' }}>
        <View sx={{ height: '100%', borderRadius: '$full', bg: barColor, width: `${score}%` }} />
      </View>
      <Text sx={{ fontSize: '$xs', color: 'gray400' }}>{Math.round(weight * 100)}% weight</Text>
    </View>
  );
}

function AssessmentBadge({ assessment }: { assessment: string }) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    likely_eligible: { label: 'Likely Eligible', bg: 'green100', text: 'green800' },
    possibly_eligible: { label: 'Possibly Eligible', bg: 'yellow100', text: 'yellow800' },
    likely_ineligible: { label: 'Likely Ineligible', bg: 'red100', text: 'red800' },
  };
  const config = configs[assessment] ?? { label: assessment, bg: 'gray100', text: 'gray800' };

  return (
    <View sx={{ borderRadius: '$full', bg: config.bg, px: '$3', py: '$1' }}>
      <Text sx={{ fontSize: '$sm', fontWeight: '500', color: config.text }}>{config.label}</Text>
    </View>
  );
}

export function EligibilityBreakdown({
  items,
  llmAssessment,
  potentialBlockers,
  matchScore,
}: EligibilityBreakdownProps) {
  return (
    <View sx={{ gap: '$6' }}>
      {/* Overall score */}
      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$4' }}>
        <View
          sx={{
            width: 80,
            height: 80,
            borderRadius: '$2xl',
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            ...(matchScore >= 70
              ? { color: 'green700', borderColor: 'green200', bg: 'green50' }
              : matchScore >= 40
                ? { color: 'yellow700', borderColor: 'yellow200', bg: 'yellow50' }
                : { color: 'red700', borderColor: 'red200', bg: 'red50' }),
          }}
        >
          <Text
            sx={{
              fontSize: '$2xl',
              fontWeight: '700',
              color: matchScore >= 70 ? 'green700' : matchScore >= 40 ? 'yellow700' : 'red700',
            }}
          >
            {Math.round(matchScore)}
          </Text>
          <Text
            sx={{
              fontSize: '$xs',
              opacity: 0.6,
              color: matchScore >= 70 ? 'green700' : matchScore >= 40 ? 'yellow700' : 'red700',
            }}
          >
            / 100
          </Text>
        </View>
        <View sx={{ flex: 1 }}>
          <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900' }}>Match Score</Text>
          <Text sx={{ fontSize: '$sm', color: 'gray500' }}>Based on 6 eligibility dimensions</Text>
        </View>
        {llmAssessment && <AssessmentBadge assessment={llmAssessment.overallAssessment} />}
      </View>

      {/* Dimension breakdown */}
      <View>
        {items.map((item) => (
          <View
            key={item.category}
            sx={{
              py: '$3',
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '$3',
              borderBottomWidth: 1,
              borderColor: 'gray100',
            }}
          >
            <StatusIcon status={item.status} />
            <View sx={{ flex: 1 }}>
              <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>
                  {categoryLabels[item.category] ?? item.category}
                </Text>
                <ScoreBar score={item.score} weight={item.weight} />
              </View>
              <Text sx={{ fontSize: '$sm', color: 'gray500', mt: 2 }}>{item.reason}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Potential blockers */}
      {potentialBlockers.length > 0 && (
        <View sx={{ bg: 'red50', borderWidth: 1, borderColor: 'red200', borderRadius: '$lg', p: '$4' }}>
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'red800', mb: '$2' }}>
            Potential Concerns
          </Text>
          {potentialBlockers.map((blocker, i) => (
            <View key={i} sx={{ flexDirection: 'row', gap: '$2' }}>
              <Text sx={{ fontSize: '$sm', color: 'red700' }}>{'\u2022'}</Text>
              <Text sx={{ fontSize: '$sm', color: 'red700', flex: 1 }}>{blocker}</Text>
            </View>
          ))}
        </View>
      )}

      {/* LLM Assessment details */}
      {llmAssessment && (
        <View sx={{ bg: 'blue50', borderWidth: 1, borderColor: 'blue200', borderRadius: '$lg', p: '$4', gap: '$3' }}>
          <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'blue800' }}>AI Assessment</Text>
          <Text sx={{ fontSize: '$sm', color: 'blue900' }}>{llmAssessment.reasoning}</Text>

          {llmAssessment.missingInfo.length > 0 && (
            <View>
              <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'blue700', textTransform: 'uppercase', letterSpacing: 0.5, mb: '$1' }}>
                Missing Information
              </Text>
              {llmAssessment.missingInfo.map((info, i) => (
                <View key={i} sx={{ flexDirection: 'row', gap: '$2' }}>
                  <Text sx={{ fontSize: '$sm', color: 'blue800' }}>{'\u2022'}</Text>
                  <Text sx={{ fontSize: '$sm', color: 'blue800', flex: 1 }}>{info}</Text>
                </View>
              ))}
            </View>
          )}

          {llmAssessment.actionItems.length > 0 && (
            <View>
              <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'blue700', textTransform: 'uppercase', letterSpacing: 0.5, mb: '$1' }}>
                Recommended Next Steps
              </Text>
              {llmAssessment.actionItems.map((action, i) => (
                <View key={i} sx={{ flexDirection: 'row', gap: '$2' }}>
                  <Text sx={{ fontSize: '$sm', color: 'blue800' }}>{i + 1}.</Text>
                  <Text sx={{ fontSize: '$sm', color: 'blue800', flex: 1 }}>{action}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
