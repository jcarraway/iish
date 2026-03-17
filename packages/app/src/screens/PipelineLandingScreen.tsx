import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useGetPipelineJobsQuery } from '../generated/graphql';

const STATUS_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
  queued: { label: 'Queued', bg: '#FEF9C3', fg: '#854D0E' },
  running: { label: 'Running', bg: '#DBEAFE', fg: '#1E40AF' },
  complete: { label: 'Complete', bg: '#DCFCE7', fg: '#166534' },
  failed: { label: 'Failed', bg: '#FEE2E2', fg: '#991B1B' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', fg: '#374151' },
};

export function PipelineLandingScreen() {
  const { data, loading } = useGetPipelineJobsQuery();
  const jobs = data?.pipelineJobs ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading pipeline...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        {/* Hero */}
        <View sx={{ borderRadius: 12, bg: '#F5F3FF', borderWidth: 1, borderColor: '#DDD6FE', p: '$6', mb: '$8' }}>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Neoantigen Pipeline</Text>
          <Text sx={{ mt: '$2', color: 'gray600', fontSize: 15 }}>
            Analyze tumor and normal sequencing data to predict neoantigens and design a personalized mRNA vaccine blueprint.
          </Text>
        </View>

        {jobs.length === 0 ? (
          <View sx={{ borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB', p: '$12', alignItems: 'center' }}>
            <Text sx={{ mt: '$4', fontSize: 18, fontWeight: '600', color: 'gray900' }}>No pipeline jobs yet</Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500', textAlign: 'center' }}>
              Upload your tumor and normal sequencing files to get started.
            </Text>
            <Link href="/pipeline/upload">
              <View sx={{ mt: '$6', bg: '#7C3AED', borderRadius: 8, px: '$6', py: 10 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Upload Sequencing Data</Text>
              </View>
            </Link>
          </View>
        ) : (
          <View>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: '$4' }}>
              <Text sx={{ fontSize: 18, fontWeight: '600', color: 'gray900' }}>Your Pipeline Jobs</Text>
              <Link href="/pipeline/upload">
                <View sx={{ bg: '#7C3AED', borderRadius: 8, px: '$4', py: '$2' }}>
                  <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>New Analysis</Text>
                </View>
              </Link>
            </View>

            {jobs.map((job) => {
              const badge = STATUS_BADGES[job.status] ?? STATUS_BADGES.queued;
              return (
                <Link key={job.id} href={`/pipeline/jobs/${job.id}`}>
                  <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5', mb: '$3' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                        <View sx={{ bg: badge.bg, borderRadius: 12, px: 10, py: 2 }}>
                          <Text sx={{ fontSize: 12, fontWeight: '500', color: badge.fg }}>{badge.label}</Text>
                        </View>
                        {job.currentStep && (
                          <Text sx={{ fontSize: 13, color: 'gray500' }}>
                            Step: {job.currentStep.replace(/_/g, ' ')}
                          </Text>
                        )}
                      </View>
                      <Text sx={{ fontSize: 12, color: '#9CA3AF' }}>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View sx={{ mt: '$3', flexDirection: 'row', gap: '$6' }}>
                      <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.stepsCompleted.length}/7 steps</Text>
                      {job.variantCount != null && (
                        <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.variantCount.toLocaleString()} variants</Text>
                      )}
                      {job.neoantigenCount != null && (
                        <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.neoantigenCount} neoantigens</Text>
                      )}
                    </View>
                  </View>
                </Link>
              );
            })}

            <Link href="/pipeline/jobs">
              <Text sx={{ textAlign: 'center', fontSize: 14, color: '#7C3AED', mt: '$2' }}>View all jobs</Text>
            </Link>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
