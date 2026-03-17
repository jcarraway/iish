import { View, Text, ScrollView } from 'dripsy';
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

export function PipelineJobsScreen() {
  const { data, loading } = useGetPipelineJobsQuery();
  const jobs = data?.pipelineJobs ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading jobs...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: '$8' }}>
          <Text sx={{ fontSize: 28, fontWeight: '700', color: 'gray900' }}>Pipeline Jobs</Text>
          <Link href="/pipeline/upload">
            <View sx={{ bg: '#7C3AED', borderRadius: 8, px: '$4', py: '$2' }}>
              <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>New Analysis</Text>
            </View>
          </Link>
        </View>

        {jobs.length === 0 ? (
          <View sx={{ borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: '#D1D5DB', p: '$12', alignItems: 'center' }}>
            <Text sx={{ fontSize: 18, fontWeight: '600', color: 'gray900' }}>No pipeline jobs</Text>
            <Text sx={{ mt: '$2', fontSize: 14, color: 'gray500' }}>Upload sequencing data to start your first analysis.</Text>
            <Link href="/pipeline/upload">
              <View sx={{ mt: '$4', bg: '#7C3AED', borderRadius: 8, px: '$6', py: 10 }}>
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>Upload Data</Text>
              </View>
            </Link>
          </View>
        ) : (
          <View>
            {jobs.map((job) => {
              const badge = STATUS_BADGES[job.status] ?? STATUS_BADGES.queued;
              const duration =
                job.startedAt && job.completedAt
                  ? `${Math.round((new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime()) / 60000)}min`
                  : job.startedAt
                    ? 'In progress'
                    : null;
              const progress = job.stepsCompleted.length / 7;

              return (
                <Link key={job.id} href={`/pipeline/jobs/${job.id}`}>
                  <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$5', mb: '$3' }}>
                    <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
                        <View sx={{ bg: badge.bg, borderRadius: 12, px: 10, py: 2 }}>
                          <Text sx={{ fontSize: 12, fontWeight: '500', color: badge.fg }}>{badge.label}</Text>
                        </View>
                        <Text sx={{ fontSize: 14, fontWeight: '500', color: 'gray900' }}>
                          Job {job.id.slice(0, 8)}
                        </Text>
                      </View>
                      <Text sx={{ fontSize: 12, color: '#9CA3AF' }}>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    <View sx={{ mt: '$3', flexDirection: 'row', gap: '$6', flexWrap: 'wrap' }}>
                      <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.stepsCompleted.length}/7 steps</Text>
                      <Text sx={{ fontSize: 12, color: 'gray600', textTransform: 'uppercase' }}>{job.inputFormat}</Text>
                      {job.variantCount != null && (
                        <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.variantCount.toLocaleString()} variants</Text>
                      )}
                      {job.neoantigenCount != null && (
                        <Text sx={{ fontSize: 14, color: 'gray600' }}>{job.neoantigenCount} neoantigens</Text>
                      )}
                      {duration && <Text sx={{ fontSize: 14, color: 'gray600' }}>{duration}</Text>}
                    </View>

                    {job.currentStep && (
                      <View sx={{ mt: '$2', height: 6, borderRadius: 3, bg: '#E5E7EB' }}>
                        <View sx={{ height: 6, borderRadius: 3, bg: '#8B5CF6', width: `${progress * 100}%` as any }} />
                      </View>
                    )}
                  </View>
                </Link>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
