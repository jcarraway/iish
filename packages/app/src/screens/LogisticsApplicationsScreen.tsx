import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetAssistanceApplicationsQuery,
  useUpdateAssistanceApplicationMutation,
  GetAssistanceApplicationsDocument,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  not_started: { bg: '#F3F4F6', fg: '#6B7280', label: 'Not Started' },
  applied: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Applied' },
  in_review: { bg: '#FEF3C7', fg: '#92400E', label: 'In Review' },
  approved: { bg: '#DCFCE7', fg: '#166534', label: 'Approved' },
  denied: { bg: '#FEE2E2', fg: '#991B1B', label: 'Denied' },
};

const STATUS_OPTIONS = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'Applied', value: 'applied' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Denied', value: 'denied' },
];

interface AssistanceApplication {
  id: string;
  assessmentId: string;
  programKey: string;
  programName: string;
  status: string;
  appliedAt?: string | null;
  notes?: string | null;
}

// ============================================================================
// Component
// ============================================================================

export function LogisticsApplicationsScreen() {
  const { data, loading } = useGetAssistanceApplicationsQuery({ errorPolicy: 'ignore' });
  const [updateApplication] = useUpdateAssistanceApplicationMutation({
    refetchQueries: [{ query: GetAssistanceApplicationsDocument }],
  });

  const applications: AssistanceApplication[] = data?.assistanceApplications ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          My Applications
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading applications...</Text>
        </View>
      </View>
    );
  }

  // Summary counts
  const appliedCount = applications.filter((a) => a.status === 'applied').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const pendingCount = applications.filter((a) => a.status === 'in_review').length;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>
          My Applications
        </Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Track your assistance program applications
        </Text>

        {/* Summary card */}
        {applications.length > 0 && (
          <View sx={{
            mt: '$6',
            borderWidth: 1,
            borderColor: '$border',
            borderRadius: 12,
            p: '$5',
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}>
            <View sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#1E40AF' }}>
                {appliedCount}
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                Applied
              </Text>
            </View>
            <View sx={{ width: 1, backgroundColor: '$border' }} />
            <View sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#166534' }}>
                {approvedCount}
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                Approved
              </Text>
            </View>
            <View sx={{ width: 1, backgroundColor: '$border' }} />
            <View sx={{ alignItems: 'center' }}>
              <Text sx={{ fontSize: 24, fontWeight: 'bold', color: '#92400E' }}>
                {pendingCount}
              </Text>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: '$1' }}>
                Pending
              </Text>
            </View>
          </View>
        )}

        {/* Empty state */}
        {applications.length === 0 && (
          <View sx={{
            mt: '$8',
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: '$border',
            borderRadius: 16,
            p: '$8',
            alignItems: 'center',
          }}>
            <Text sx={{ fontSize: 36 }}>{'\uD83D\uDCDD'}</Text>
            <Text sx={{ mt: '$3', fontSize: 20, fontWeight: '600', color: '$foreground', textAlign: 'center' }}>
              No applications tracked yet
            </Text>
            <Text sx={{
              mt: '$3', fontSize: 14, color: '$mutedForeground',
              textAlign: 'center', maxWidth: 400, lineHeight: 22,
            }}>
              Visit Assistance Programs to see what you are eligible for. Once you apply,
              track your application status here.
            </Text>
            <Link href="/logistics/programs">
              <View sx={{
                mt: '$5',
                backgroundColor: 'blue600',
                borderRadius: 8,
                px: '$6',
                py: '$3',
              }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  View Assistance Programs
                </Text>
              </View>
            </Link>
          </View>
        )}

        {/* Application cards */}
        {applications.length > 0 && (
          <View sx={{ mt: '$6' }}>
            <SectionHeader title="Applications" />

            <View sx={{ mt: '$4', gap: '$3' }}>
              {applications.map((application) => {
                const statusInfo = STATUS_COLORS[application.status] ?? STATUS_COLORS.not_started;

                return (
                  <View key={application.id} sx={{
                    borderWidth: 1,
                    borderColor: '$border',
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
                          {application.programName}
                        </Text>
                        {application.appliedAt && (
                          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                      <View sx={{
                        backgroundColor: statusInfo.bg,
                        borderRadius: 12,
                        px: '$3',
                        py: 4,
                      }}>
                        <Text sx={{
                          fontSize: 11,
                          fontWeight: 'bold',
                          color: statusInfo.fg,
                          textTransform: 'uppercase',
                        }}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    {application.notes && (
                      <Text sx={{ mt: '$3', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                        {application.notes}
                      </Text>
                    )}

                    {/* Status update picker */}
                    <View sx={{ mt: '$4' }}>
                      <Text sx={{ fontSize: 12, fontWeight: '600', color: '$mutedForeground', mb: '$2' }}>
                        Update status
                      </Text>
                      <Picker
                        value={application.status}
                        onValueChange={(newStatus) => {
                          if (newStatus !== application.status) {
                            updateApplication({
                              variables: {
                                input: {
                                  assessmentId: application.assessmentId,
                                  programKey: application.programKey,
                                  status: newStatus,
                                },
                              },
                            });
                          }
                        }}
                        options={STATUS_OPTIONS}
                        placeholder="Select status"
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Navigation */}
        <View sx={{ mt: '$8', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <Link href="/logistics">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                {'\u2190'} Dashboard
              </Text>
            </View>
          </Link>
          <Link href="/logistics/programs">
            <View sx={{
              borderRadius: 10, borderWidth: 1, borderColor: '$border', px: '$4', py: '$3',
            }}>
              <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                Assistance Programs {'\u2192'}
              </Text>
            </View>
          </Link>
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
