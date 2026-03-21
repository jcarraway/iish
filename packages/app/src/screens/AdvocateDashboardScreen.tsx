import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetInsuranceDenialsQuery } from '../generated/graphql';

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  denied: { bg: '#FEE2E2', fg: '#991B1B', label: 'Denied' },
  appeal_drafted: { bg: '#FEF3C7', fg: '#92400E', label: 'Appeal Drafted' },
  submitted: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Submitted' },
  appeal_won: { bg: '#DCFCE7', fg: '#166534', label: 'Won' },
  appeal_lost: { bg: '#F3F4F6', fg: '#6B7280', label: 'Lost' },
  under_review: { bg: '#E0E7FF', fg: '#4338CA', label: 'Under Review' },
};

// ============================================================================
// Component
// ============================================================================

export function AdvocateDashboardScreen() {
  const { data, loading } = useGetInsuranceDenialsQuery({ errorPolicy: 'ignore' });
  const denials = data?.insuranceDenials ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Insurance Advocate</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your denials...</Text>
        </View>
      </View>
    );
  }

  const activeDenials = denials.filter(
    d => !['appeal_won', 'appeal_lost'].includes(d.status),
  );
  const resolvedDenials = denials.filter(
    d => ['appeal_won', 'appeal_lost'].includes(d.status),
  );

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          Insurance Advocate
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Fight back against unfair denials
        </Text>

        {/* Report a denial button */}
        <Link href="/advocate/new-denial">
          <View sx={{
            mt: '$6',
            backgroundColor: 'blue600',
            borderRadius: 8,
            px: '$6',
            py: '$3',
            alignSelf: 'flex-start',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
              Report a denial
            </Text>
          </View>
        </Link>

        {/* No denials welcome state */}
        {denials.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 20, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No denials reported yet
            </Text>
            <Text sx={{
              mt: '$3',
              fontSize: 14,
              color: '$mutedForeground',
              textAlign: 'center',
              maxWidth: 480,
              lineHeight: 22,
            }}>
              If your insurance has denied coverage for genomic testing, a clinical trial,
              fertility preservation, or any cancer-related service, we can help you fight back.
              Our AI-powered appeal letter generator uses your medical records and the latest
              clinical guidelines to build a strong case.
            </Text>
            <Link href="/advocate/new-denial">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  Report a denial
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* Active denials */}
        {activeDenials.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Active Denials
              </Text>
            </View>

            <View sx={{ mt: '$4', gap: '$3' }}>
              {activeDenials.map(denial => {
                const status = STATUS_COLORS[denial.status] ?? STATUS_COLORS.denied;
                const deadlineInfo = getDeadlineInfo(denial.appealDeadline);

                return (
                  <Link key={denial.id} href={`/advocate/appeal/${denial.id}`}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: deadlineInfo.urgent ? '#FCA5A5' : '$border',
                      backgroundColor: deadlineInfo.urgent ? '#FEF2F2' : undefined,
                      borderRadius: 12,
                      p: '$5',
                    }}>
                      <View sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}>
                        <View sx={{ flex: 1, mr: '$3' }}>
                          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>
                            {denial.deniedService}
                          </Text>
                          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                            {denial.insurerName}
                            {' \u00B7 '}
                            Denied {new Date(denial.denialDate).toLocaleDateString()}
                          </Text>
                        </View>
                        <View sx={{
                          backgroundColor: status.bg,
                          borderRadius: 12,
                          px: '$2',
                          py: 3,
                        }}>
                          <Text sx={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: status.fg,
                          }}>
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      {/* Appeal deadline alert */}
                      {denial.appealDeadline && (
                        <View sx={{
                          mt: '$3',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '$2',
                        }}>
                          <View sx={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: deadlineInfo.color,
                          }} />
                          <Text sx={{
                            fontSize: 12,
                            fontWeight: '500',
                            color: deadlineInfo.textColor,
                          }}>
                            {deadlineInfo.label}
                          </Text>
                        </View>
                      )}

                      {/* Appeal letters summary */}
                      {denial.appealLetters.length > 0 && (
                        <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground' }}>
                          {denial.appealLetters.length} appeal{denial.appealLetters.length !== 1 ? 's' : ''} generated
                        </Text>
                      )}

                      <Text sx={{ mt: '$2', fontSize: 12, color: 'blue600' }}>
                        View details {'\u2192'}
                      </Text>
                    </View>
                  </Link>
                );
              })}
            </View>
          </View>
        )}

        {/* Resolved denials */}
        {resolvedDenials.length > 0 && (
          <View sx={{ mt: '$8' }}>
            <View sx={{ borderBottomWidth: 1, borderBottomColor: '$border', pb: '$3' }}>
              <Text sx={{ fontSize: 20, fontWeight: 'bold', color: '$foreground' }}>
                Resolved
              </Text>
            </View>

            <View sx={{ mt: '$4', gap: '$3' }}>
              {resolvedDenials.map(denial => {
                const status = STATUS_COLORS[denial.status] ?? STATUS_COLORS.appeal_lost;

                return (
                  <Link key={denial.id} href={`/advocate/appeal/${denial.id}`}>
                    <View sx={{
                      borderWidth: 1,
                      borderColor: '$border',
                      borderRadius: 12,
                      p: '$4',
                    }}>
                      <View sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <View sx={{ flex: 1, mr: '$3' }}>
                          <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>
                            {denial.deniedService}
                          </Text>
                          <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
                            {denial.insurerName}
                          </Text>
                        </View>
                        <View sx={{
                          backgroundColor: status.bg,
                          borderRadius: 12,
                          px: '$2',
                          py: 3,
                        }}>
                          <Text sx={{ fontSize: 11, fontWeight: '600', color: status.fg }}>
                            {status.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Link>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick links */}
        <View sx={{ mt: '$8', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/advocate/rights">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Know Your Rights
              </Text>
            </View>
          </Link>
          <Link href="/advocate/escalation">
            <View sx={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '$border',
              px: '$4',
              py: '$3',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '$2',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Escalation Guide
              </Text>
            </View>
          </Link>
        </View>

        {/* Disclaimer */}
        <View sx={{
          mt: '$8',
          backgroundColor: '#FFFBEB',
          borderWidth: 1,
          borderColor: '#FDE68A',
          borderRadius: 12,
          p: '$5',
        }}>
          <Text sx={{ fontSize: 13, fontWeight: '600', color: '#92400E' }}>
            Important disclaimer
          </Text>
          <Text sx={{ mt: '$2', fontSize: 12, color: '#78350F', lineHeight: 18 }}>
            Appeal letters are AI-generated and must be reviewed and signed by your physician
            before submission. IISH does not provide legal advice. All generated documents
            carry a physician review requirement.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getDeadlineInfo(appealDeadline: string | null | undefined): {
  label: string;
  color: string;
  textColor: string;
  urgent: boolean;
} {
  if (!appealDeadline) {
    return { label: 'No deadline set', color: '#9CA3AF', textColor: '#6B7280', urgent: false };
  }

  const now = new Date();
  const deadline = new Date(appealDeadline);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Appeal deadline passed ${Math.abs(diffDays)} days ago`,
      color: '#EF4444',
      textColor: '#991B1B',
      urgent: true,
    };
  }
  if (diffDays < 7) {
    return {
      label: `Appeal deadline in ${diffDays} day${diffDays !== 1 ? 's' : ''} — act now`,
      color: '#EF4444',
      textColor: '#991B1B',
      urgent: true,
    };
  }
  if (diffDays < 30) {
    return {
      label: `Appeal deadline in ${diffDays} days`,
      color: '#F59E0B',
      textColor: '#92400E',
      urgent: false,
    };
  }
  return {
    label: `Appeal deadline: ${deadline.toLocaleDateString()}`,
    color: '#22C55E',
    textColor: '#166534',
    urgent: false,
  };
}
