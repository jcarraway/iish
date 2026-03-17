import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { BlueprintVisualization } from '../components';
import { openExternalUrl } from '../utils';
import { useGetPipelineJobQuery, useGetReportPdfLazyQuery } from '../generated/graphql';

export function PipelineBlueprintScreen({ jobId }: { jobId: string }) {
  const { data, loading } = useGetPipelineJobQuery({ variables: { id: jobId } });
  const [fetchPdf, { loading: downloading }] = useGetReportPdfLazyQuery();

  const job = data?.pipelineJob;

  const handleDownload = async () => {
    const result = await fetchPdf({ variables: { pipelineJobId: jobId, reportType: 'manufacturer' } });
    const url = result.data?.reportPdf.url;
    if (url) openExternalUrl(url);
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text sx={{ mt: '$4', color: 'gray600' }}>Loading blueprint...</Text>
      </View>
    );
  }

  if (!job || job.status !== 'complete') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Blueprint Not Available</Text>
        <Text sx={{ mt: '$2', color: 'gray500' }}>The pipeline job must be complete to view the vaccine blueprint.</Text>
        <Link href={`/pipeline/jobs/${jobId}`}>
          <Text sx={{ mt: '$4', color: '#7C3AED' }}>Back to Job</Text>
        </Link>
      </View>
    );
  }

  if (!job.vaccineBlueprint) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>No Blueprint Data</Text>
        <Text sx={{ mt: '$2', color: 'gray500' }}>No vaccine blueprint was generated for this job.</Text>
        <Link href={`/pipeline/jobs/${jobId}`}>
          <Text sx={{ mt: '$4', color: '#7C3AED' }}>Back to Job</Text>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <View sx={{ mb: '$6' }}>
          <Link href={`/pipeline/jobs/${jobId}`}>
            <Text sx={{ fontSize: 13, color: 'gray500', mb: '$1' }}>{'<'} Back to Job</Text>
          </Link>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text sx={{ fontSize: 22, fontWeight: '700', color: 'gray900' }}>Vaccine Blueprint</Text>
            <Pressable onPress={handleDownload} disabled={downloading}>
              <View sx={{ bg: '#7C3AED', borderRadius: 8, px: '$4', py: '$2', flexDirection: 'row', alignItems: 'center', gap: '$2', opacity: downloading ? 0.6 : 1 }}>
                {downloading && <ActivityIndicator size="small" color="#fff" />}
                <Text sx={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                  {downloading ? 'Generating PDF...' : 'Download Manufacturer Blueprint'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <BlueprintVisualization
          blueprint={job.vaccineBlueprint as any}
          hlaGenotype={job.hlaGenotype as any}
        />
      </View>
    </ScrollView>
  );
}
