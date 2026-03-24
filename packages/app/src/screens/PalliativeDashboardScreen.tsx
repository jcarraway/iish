import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetLatestPalliativeAssessmentQuery,
  useGetShouldRecommendPalliativeQuery,
} from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const TRIAGE_COLORS: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  emergency: { bg: '#FEE2E2', fg: '#991B1B', border: '#FCA5A5', label: 'Emergency' },
  urgent: { bg: '#FFF7ED', fg: '#9A3412', border: '#FDBA74', label: 'Urgent' },
  monitor: { bg: '#FEF9C3', fg: '#854D0E', border: '#FDE047', label: 'Monitor' },
  routine: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0', label: 'Routine' },
};

const MISCONCEPTIONS = [
  {
    myth: 'Palliative care means giving up.',
    reality:
      'Palliative care is active treatment for symptoms and quality of life. It works alongside your cancer treatment, not instead of it.',
  },
  {
    myth: 'Palliative care is the same as hospice.',
    reality:
      'Hospice is end-of-life care. Palliative care can start at any point after diagnosis and continue through curative treatment.',
  },
  {
    myth: 'You have to choose between treatment and palliative care.',
    reality:
      'You can receive both simultaneously. A landmark study showed patients who received early palliative care alongside treatment had better quality of life AND lived longer.',
  },
];

// ============================================================================
// Component
// ============================================================================

export function PalliativeDashboardScreen() {
  const { data: assessmentData, loading: assessmentLoading } =
    useGetLatestPalliativeAssessmentQuery({ errorPolicy: 'ignore' });
  const { data: recommendData, loading: recommendLoading } =
    useGetShouldRecommendPalliativeQuery({ errorPolicy: 'ignore' });

  const loading = assessmentLoading || recommendLoading;
  const assessment = assessmentData?.latestPalliativeAssessment;
  const shouldRecommend = recommendData?.shouldRecommendPalliative;
  const triageInfo = assessment?.triageLevel
    ? TRIAGE_COLORS[assessment.triageLevel] ?? TRIAGE_COLORS.routine
    : null;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Palliative Care
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Palliative Care
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Symptom management and quality of life support — alongside your cancer treatment
        </Text>

        {/* ============================================================= */}
        {/* Recommendation Alert */}
        {/* ============================================================= */}
        {shouldRecommend?.recommended && (
          <View
            sx={{
              mt: '$6',
              backgroundColor: '#FFFBEB',
              borderWidth: 2,
              borderColor: '#F59E0B',
              borderRadius: 12,
              p: '$5',
            }}
          >
            <Text sx={{ fontSize: 16, fontWeight: 'bold', color: '#92400E' }}>
              Palliative care may help you right now
            </Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: '#78350F', lineHeight: 22 }}>
              {shouldRecommend.reasons?.[0] ??
                'Based on your symptoms and treatment, a palliative care consultation could improve your comfort and quality of life.'}
            </Text>
            <Link href="/palliative/providers">
              <View
                sx={{
                  mt: '$3',
                  backgroundColor: '#F59E0B',
                  borderRadius: 8,
                  px: '$5',
                  py: '$3',
                  alignSelf: 'flex-start',
                }}
              >
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Find a palliative care provider
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* ============================================================= */}
        {/* Education: NOT Hospice */}
        {/* ============================================================= */}
        <View sx={{ mt: '$6' }}>
          <SectionHeader title="Palliative Care is NOT Hospice" />

          <View
            sx={{
              mt: '$4',
              backgroundColor: '#F0F9FF',
              borderWidth: 1,
              borderColor: '#BAE6FD',
              borderRadius: 12,
              p: '$5',
            }}
          >
            <Text sx={{ fontSize: 14, color: '#075985', lineHeight: 22 }}>
              Palliative care is specialized medical care focused on providing relief from
              symptoms, pain, and stress of a serious illness. The goal is to improve quality
              of life for both you and your family. It is appropriate at any age and any stage,
              and can be provided alongside curative treatment.
            </Text>
          </View>

          <View sx={{ mt: '$4', gap: '$3' }}>
            {MISCONCEPTIONS.map((item, i) => (
              <View
                key={i}
                sx={{
                  borderWidth: 1,
                  borderColor: '$border',
                  borderRadius: 12,
                  p: '$4',
                }}
              >
                <View
                  sx={{
                    backgroundColor: '#FEE2E2',
                    borderRadius: 8,
                    px: '$3',
                    py: '$1',
                    alignSelf: 'flex-start',
                    mb: '$2',
                  }}
                >
                  <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#991B1B' }}>MYTH</Text>
                </View>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', lineHeight: 20 }}>
                  {item.myth}
                </Text>
                <View
                  sx={{
                    mt: '$3',
                    backgroundColor: '#DCFCE7',
                    borderRadius: 8,
                    px: '$3',
                    py: '$1',
                    alignSelf: 'flex-start',
                    mb: '$2',
                  }}
                >
                  <Text sx={{ fontSize: 12, fontWeight: 'bold', color: '#166534' }}>REALITY</Text>
                </View>
                <Text sx={{ fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {item.reality}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ============================================================= */}
        {/* Latest Assessment */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Latest Assessment" />

          {assessment && triageInfo ? (
            <View
              sx={{
                mt: '$4',
                borderWidth: 2,
                borderColor: triageInfo.border,
                borderRadius: 12,
                p: '$5',
              }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                  Triage Level:
                </Text>
                <View
                  sx={{
                    backgroundColor: triageInfo.bg,
                    borderRadius: 12,
                    px: '$3',
                    py: 4,
                  }}
                >
                  <Text
                    sx={{
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: triageInfo.fg,
                      textTransform: 'uppercase',
                    }}
                  >
                    {triageInfo.label}
                  </Text>
                </View>
              </View>

              {(assessment.esasScores as any)?.totalScore != null && (
                <Text sx={{ mt: '$3', fontSize: 14, color: '$foreground' }}>
                  ESAS Total Score: {(assessment.esasScores as any).totalScore}/90
                </Text>
              )}

              {assessment.triageRationale && (
                <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', lineHeight: 20 }}>
                  {assessment.triageRationale}
                </Text>
              )}

              <Text sx={{ mt: '$3', fontSize: 11, color: '$mutedForeground' }}>
                Assessed {new Date(assessment.createdAt).toLocaleDateString()}
              </Text>

              <Link href="/palliative/assessment">
                <View
                  sx={{
                    mt: '$4',
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 8,
                    px: '$4',
                    py: '$2',
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text sx={{ fontSize: 13, fontWeight: '600', color: '$foreground' }}>
                    New assessment
                  </Text>
                </View>
              </Link>
            </View>
          ) : (
            <View
              sx={{
                mt: '$4',
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: '$border',
                borderRadius: 12,
                p: '$5',
                alignItems: 'center',
              }}
            >
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
                No assessments yet
              </Text>
              <Text
                sx={{
                  mt: '$2',
                  fontSize: 13,
                  color: '$mutedForeground',
                  textAlign: 'center',
                  maxWidth: 400,
                }}
              >
                Complete your first ESAS symptom assessment to track your symptoms and get
                personalized recommendations.
              </Text>
              <Link href="/palliative/assessment">
                <View
                  sx={{
                    mt: '$4',
                    backgroundColor: 'blue600',
                    borderRadius: 8,
                    px: '$6',
                    py: '$3',
                  }}
                >
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                    Start assessment
                  </Text>
                </View>
              </Link>
            </View>
          )}
        </View>

        {/* ============================================================= */}
        {/* Quick Links */}
        {/* ============================================================= */}
        <View sx={{ mt: '$8' }}>
          <SectionHeader title="Explore" />

          <View sx={{ mt: '$4', gap: '$3' }}>
            <QuickLink
              href="/palliative/assessment"
              iconBg="#EDE9FE"
              icon="9"
              title="Symptom Assessment"
              subtitle="ESAS-r: rate 9 symptoms on a 0-10 scale"
            />
            <QuickLink
              href="/palliative/providers"
              iconBg="#DBEAFE"
              icon="P"
              title="Find Providers"
              subtitle="Palliative care specialists near you"
            />
            <QuickLink
              href="/palliative/advance-care"
              iconBg="#FCE7F3"
              icon="A"
              title="Advance Care Planning"
              subtitle="Document your preferences and priorities"
            />
            <QuickLink
              href="/palliative/education"
              iconBg="#DCFCE7"
              icon="E"
              title="Learn More"
              subtitle="Evidence, myths, and what to expect"
            />
          </View>
        </View>

        {/* Disclaimer */}
        <View
          sx={{
            mt: '$8',
            backgroundColor: '#FFFBEB',
            borderWidth: 1,
            borderColor: '#FDE68A',
            borderRadius: 12,
            p: '$5',
          }}
        >
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            This tool helps you track and communicate symptoms but is not a substitute for
            professional medical evaluation. If you are experiencing severe or worsening
            symptoms, contact your care team immediately.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
      <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>{title}</Text>
    </View>
  );
}

function QuickLink({
  href,
  iconBg,
  icon,
  title,
  subtitle,
}: {
  href: string;
  iconBg: string;
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link href={href}>
      <View
        sx={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '$border',
          p: '$5',
        }}
      >
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <View
            sx={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: iconBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text sx={{ fontSize: 18, fontWeight: 'bold', color: '$foreground' }}>{icon}</Text>
          </View>
          <View sx={{ flex: 1 }}>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '$foreground' }}>{title}</Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>{subtitle}</Text>
          </View>
          <Text sx={{ fontSize: 16, color: '$mutedForeground' }}>{'\u2192'}</Text>
        </View>
      </View>
    </Link>
  );
}
