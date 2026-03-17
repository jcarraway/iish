import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { PipelineProgressBar } from '../components';
import { confirmAction, openExternalUrl } from '../utils';
import {
  useGetPipelineJobQuery,
  useCancelPipelineJobMutation,
  useGetPipelineResultsLazyQuery,
} from '../generated/graphql';

const STEP_LABELS: Record<string, string> = {
  alignment: 'Alignment',
  variant_calling: 'Variant Calling',
  hla_typing: 'HLA Typing',
  neoantigen_prediction: 'Neoantigen Prediction',
  structure_prediction: 'Structure Prediction',
  ranking: 'Ranking',
  mrna_design: 'mRNA Design',
};

const CONFIDENCE_COLORS: Record<string, { bg: string; fg: string }> = {
  high: { bg: '#DCFCE7', fg: '#166534' },
  medium: { bg: '#FEF9C3', fg: '#854D0E' },
  low: { bg: '#FEE2E2', fg: '#991B1B' },
};

export function PipelineJobDetailScreen({ jobId }: { jobId: string }) {
  const { data, loading, error, stopPolling } = useGetPipelineJobQuery({
    variables: { id: jobId },
    pollInterval: 10000,
  });
  const [cancelJob, { loading: cancelling }] = useCancelPipelineJobMutation();
  const [fetchResults, { data: resultsData }] = useGetPipelineResultsLazyQuery();

  const job = data?.pipelineJob;
  const isActive = job?.status === 'queued' || job?.status === 'running';

  useEffect(() => {
    if (job && !['queued', 'running'].includes(job.status)) {
      stopPolling();
      if (job.status === 'complete') {
        fetchResults({ variables: { pipelineJobId: jobId } });
      }
    }
  }, [job?.status]);

  const handleCancel = () => {
    confirmAction('Cancel this pipeline job?', async () => {
      await cancelJob({ variables: { jobId } });
    });
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading job...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Job Not Found</Text>
        <Link href="/pipeline/jobs">
          <Text sx={{ mt: '$4', color: '#7C3AED', fontSize: 14 }}>Back to Jobs</Text>
        </Link>
      </View>
    );
  }

  const elapsed = job.startedAt
    ? Math.round(((job.completedAt ? new Date(job.completedAt).getTime() : Date.now()) - new Date(job.startedAt).getTime()) / 1000)
    : 0;
  const stepErrors = (job.stepErrors ?? {}) as Record<string, string>;
  const topNeoantigens = (job.topNeoantigens ?? []) as Array<{
    gene: string; mutation: string; mutantPeptide: string;
    hlaAllele: string; compositeScore: number; rank: number; confidence: string;
  }>;
  const downloads = resultsData?.pipelineResults;

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        {/* Header */}
        <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', mb: '$6' }}>
          <View>
            <Link href="/pipeline/jobs">
              <Text sx={{ fontSize: 13, color: 'gray500', mb: '$1' }}>{'<'} All Jobs</Text>
            </Link>
            <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Job {job.id.slice(0, 8)}</Text>
          </View>
          {isActive && (
            <Pressable onPress={handleCancel} disabled={cancelling}>
              <View sx={{ borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: '#DC2626' }}>
                  {cancelling ? 'Cancelling...' : 'Cancel Job'}
                </Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Progress bar */}
        <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$6', mb: '$6' }}>
          <PipelineProgressBar
            currentStep={job.currentStep ?? null}
            stepsCompleted={job.stepsCompleted as string[]}
            status={job.status}
          />
          <View sx={{ mt: '$4', flexDirection: 'row', gap: '$6', flexWrap: 'wrap' }}>
            {isActive && (
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1' }}>
                <View sx={{ height: 8, width: 8, borderRadius: 4, bg: '#3B82F6' }} />
                <Text sx={{ fontSize: 13, color: 'gray500' }}>
                  Running for {Math.floor(elapsed / 60)}m {elapsed % 60}s
                </Text>
              </View>
            )}
            {job.completedAt && (
              <Text sx={{ fontSize: 13, color: 'gray500' }}>
                Completed in {Math.floor((job.totalComputeSeconds ?? elapsed) / 60)}m{' '}
                {Math.round((job.totalComputeSeconds ?? elapsed) % 60)}s
              </Text>
            )}
            {job.estimatedCostUsd != null && (
              <Text sx={{ fontSize: 13, color: 'gray500' }}>Cost: ${job.estimatedCostUsd.toFixed(2)}</Text>
            )}
          </View>
        </View>

        {/* Step errors */}
        {Object.keys(stepErrors).length > 0 && (
          <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#FECACA', bg: '#FEF2F2', p: '$4', mb: '$6' }}>
            <Text sx={{ fontWeight: '500', color: '#991B1B' }}>Errors</Text>
            {Object.entries(stepErrors).map(([step, err]) => (
              <View key={step} sx={{ mt: '$2' }}>
                <Text sx={{ fontSize: 13 }}>
                  <Text sx={{ fontWeight: '500', color: '#B91C1C' }}>{STEP_LABELS[step] ?? step}: </Text>
                  <Text sx={{ color: '#DC2626' }}>{err}</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats grid */}
        {(job.variantCount != null || job.tmb != null || job.neoantigenCount != null) && (
          <View sx={{ flexDirection: 'row', gap: '$4', mb: '$6' }}>
            {job.variantCount != null && (
              <View sx={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4', alignItems: 'center' }}>
                <Text sx={{ fontSize: 22, fontWeight: '700', color: '#7C3AED' }}>{job.variantCount.toLocaleString()}</Text>
                <Text sx={{ fontSize: 12, color: 'gray500' }}>Variants Found</Text>
              </View>
            )}
            {job.tmb != null && (
              <View sx={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4', alignItems: 'center' }}>
                <Text sx={{ fontSize: 22, fontWeight: '700', color: '#7C3AED' }}>{job.tmb.toFixed(1)}</Text>
                <Text sx={{ fontSize: 12, color: 'gray500' }}>TMB (mut/Mb)</Text>
              </View>
            )}
            {job.neoantigenCount != null && (
              <View sx={{ flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4', alignItems: 'center' }}>
                <Text sx={{ fontSize: 22, fontWeight: '700', color: '#7C3AED' }}>{job.neoantigenCount}</Text>
                <Text sx={{ fontSize: 12, color: 'gray500' }}>Neoantigens</Text>
              </View>
            )}
          </View>
        )}

        {/* Results navigation */}
        {job.status === 'complete' && (
          <View sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '$3', mb: '$6' }}>
            {[
              { href: `/pipeline/jobs/${job.id}/neoantigens`, title: 'Neoantigen Explorer', sub: 'Browse all candidates' },
              { href: `/pipeline/jobs/${job.id}/blueprint`, title: 'Vaccine Blueprint', sub: 'View construct design' },
              { href: `/pipeline/jobs/${job.id}/trials`, title: 'Clinical Trials', sub: 'Cross-reference trials' },
              { href: `/pipeline/jobs/${job.id}/reports`, title: 'Reports', sub: 'Generate & download' },
            ].map((card) => (
              <Link key={card.href} href={card.href}>
                <View sx={{ width: 160, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
                  <Text sx={{ fontSize: 14, fontWeight: '600', color: 'gray900' }}>{card.title}</Text>
                  <Text sx={{ fontSize: 12, color: 'gray500', mt: '$1' }}>{card.sub}</Text>
                </View>
              </Link>
            ))}
          </View>
        )}

        {/* Top neoantigens table */}
        {topNeoantigens.length > 0 && (
          <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$6', mb: '$6' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$4' }}>Top Neoantigen Candidates</Text>
            {/* Header row */}
            <View sx={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E5E7EB', pb: '$2', mb: '$2' }}>
              <Text sx={{ width: 30, fontSize: 11, color: 'gray500' }}>#</Text>
              <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>Gene</Text>
              <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>Mutation</Text>
              <Text sx={{ flex: 1.5, fontSize: 11, color: 'gray500' }}>Peptide</Text>
              <Text sx={{ flex: 1, fontSize: 11, color: 'gray500' }}>HLA</Text>
              <Text sx={{ width: 50, fontSize: 11, color: 'gray500' }}>Score</Text>
              <Text sx={{ width: 60, fontSize: 11, color: 'gray500' }}>Conf.</Text>
            </View>
            {topNeoantigens.map((neo) => {
              const cc = CONFIDENCE_COLORS[neo.confidence] ?? { bg: '#F3F4F6', fg: '#374151' };
              return (
                <View key={neo.rank} sx={{ flexDirection: 'row', alignItems: 'center', py: '$2', borderBottomWidth: 1, borderColor: '#F3F4F6' }}>
                  <Text sx={{ width: 30, fontSize: 13, color: '#9CA3AF' }}>{neo.rank}</Text>
                  <Text sx={{ flex: 1, fontSize: 13, fontWeight: '500' }}>{neo.gene}</Text>
                  <Text sx={{ flex: 1, fontSize: 13, color: 'gray600' }}>{neo.mutation}</Text>
                  <Text sx={{ flex: 1.5, fontSize: 11, fontFamily: 'monospace' }}>{neo.mutantPeptide}</Text>
                  <Text sx={{ flex: 1, fontSize: 13, color: 'gray600' }}>{neo.hlaAllele}</Text>
                  <Text sx={{ width: 50, fontSize: 13, fontWeight: '500' }}>{neo.compositeScore.toFixed(2)}</Text>
                  <View sx={{ width: 60 }}>
                    <View sx={{ bg: cc.bg, borderRadius: 12, px: 8, py: 2, alignSelf: 'flex-start' }}>
                      <Text sx={{ fontSize: 11, fontWeight: '500', color: cc.fg }}>{neo.confidence}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Download results */}
        {downloads && (downloads.fullReportPdf || downloads.vaccineBlueprint || downloads.neoantigenReport || downloads.patientSummary) && (
          <View sx={{ borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', bg: '#F0FDF4', p: '$6' }}>
            <Text sx={{ fontWeight: '600', color: '#14532D', mb: '$4' }}>Download Results</Text>
            <View sx={{ gap: '$3' }}>
              {downloads.fullReportPdf && (
                <Pressable onPress={() => openExternalUrl(downloads.fullReportPdf!)}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', borderWidth: 1, borderColor: '#86EFAC', bg: 'white', borderRadius: 8, p: '$3' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>Full Report (PDF)</Text>
                  </View>
                </Pressable>
              )}
              {downloads.vaccineBlueprint && (
                <Pressable onPress={() => openExternalUrl(downloads.vaccineBlueprint!)}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', borderWidth: 1, borderColor: '#86EFAC', bg: 'white', borderRadius: 8, p: '$3' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>Vaccine Blueprint</Text>
                  </View>
                </Pressable>
              )}
              {downloads.neoantigenReport && (
                <Pressable onPress={() => openExternalUrl(downloads.neoantigenReport!)}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', borderWidth: 1, borderColor: '#86EFAC', bg: 'white', borderRadius: 8, p: '$3' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>Neoantigen Report</Text>
                  </View>
                </Pressable>
              )}
              {downloads.patientSummary && (
                <Pressable onPress={() => openExternalUrl(downloads.patientSummary!)}>
                  <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', borderWidth: 1, borderColor: '#86EFAC', bg: 'white', borderRadius: 8, p: '$3' }}>
                    <Text sx={{ fontSize: 14, fontWeight: '500', color: '#166534' }}>Patient Summary</Text>
                  </View>
                </Pressable>
              )}
            </View>
          </View>
        )}

        {/* Job metadata */}
        <View sx={{ mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', p: '$4' }}>
          <Text sx={{ fontSize: 13, fontWeight: '500', color: 'gray500', mb: '$2' }}>Job Details</Text>
          {[
            ['Job ID', job.id],
            ['Format', job.inputFormat.toUpperCase()],
            ['Reference', job.referenceGenome],
            ['Created', new Date(job.createdAt).toLocaleString()],
          ].map(([label, value]) => (
            <View key={label} sx={{ flexDirection: 'row', justifyContent: 'space-between', py: '$1' }}>
              <Text sx={{ fontSize: 13, color: '#9CA3AF' }}>{label}</Text>
              <Text sx={{ fontSize: 13, color: 'gray600' }}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
