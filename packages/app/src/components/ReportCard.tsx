import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'dripsy';
import { Platform, Linking } from 'react-native';
import { useGenerateReportLazyQuery, useGenerateReportPdfMutation } from '../generated/graphql';

interface ReportCardProps {
  type: 'patient' | 'clinician' | 'manufacturer';
  title: string;
  description: string;
  icon: React.ReactNode;
  jobId: string;
  onPreview?: (data: Record<string, unknown>) => void;
}

type Status = 'idle' | 'generating' | 'ready' | 'downloading' | 'error';

export function ReportCard({ type, title, description, icon, jobId, onPreview }: ReportCardProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [reportData, setReportData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchReport] = useGenerateReportLazyQuery();
  const [generatePdf] = useGenerateReportPdfMutation();

  const handleGenerate = async () => {
    setStatus('generating');
    setError(null);
    try {
      const { data } = await fetchReport({
        variables: { pipelineJobId: jobId, reportType: type },
      });
      if (!data?.generateReport) throw new Error('Failed to generate report');
      setReportData(data.generateReport as Record<string, unknown>);
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleDownloadPdf = async () => {
    setStatus('downloading');
    setError(null);
    try {
      const { data } = await generatePdf({
        variables: { pipelineJobId: jobId, reportType: type },
      });
      if (!data?.generateReportPdf?.url) throw new Error('Failed to generate PDF');
      if (Platform.OS === 'web') {
        window.open(data.generateReportPdf.url, '_blank');
      } else {
        Linking.openURL(data.generateReportPdf.url);
      }
      setStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const statusBadge = () => {
    if (status === 'generating' || status === 'downloading') {
      return (
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$1', borderRadius: '$full', bg: 'blue100', px: '$2', py: 2 }}>
          <ActivityIndicator size="small" sx={{ color: 'blue500' }} />
          <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'blue800' }}>
            {status === 'generating' ? 'Generating...' : 'Preparing PDF...'}
          </Text>
        </View>
      );
    }
    if (status === 'ready') {
      return (
        <View sx={{ borderRadius: '$full', bg: 'green100', px: '$2', py: 2 }}>
          <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'green800' }}>Ready</Text>
        </View>
      );
    }
    if (status === 'error') {
      return (
        <View sx={{ borderRadius: '$full', bg: 'red100', px: '$2', py: 2 }}>
          <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'red800' }}>Error</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$6' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', mb: '$3' }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <View
            sx={{
              height: 40,
              width: 40,
              borderRadius: '$lg',
              bg: 'purple100',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
          <View>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>{title}</Text>
            {statusBadge()}
          </View>
        </View>
      </View>

      <Text sx={{ fontSize: '$sm', color: 'gray500', mb: '$4' }}>{description}</Text>

      {error && (
        <Text sx={{ fontSize: '$sm', color: 'red600', mb: '$3' }}>{error}</Text>
      )}

      <View sx={{ flexDirection: 'row', gap: '$2' }}>
        {status === 'idle' || status === 'error' ? (
          <Pressable
            onPress={handleGenerate}
            sx={{ borderRadius: '$lg', bg: 'purple600', px: '$4', py: '$2' }}
          >
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Generate Report</Text>
          </Pressable>
        ) : status === 'generating' || status === 'downloading' ? (
          <View sx={{ borderRadius: '$lg', bg: 'gray100', px: '$4', py: '$2', flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <ActivityIndicator size="small" sx={{ color: 'gray400' }} />
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray400' }}>Processing...</Text>
          </View>
        ) : (
          <View sx={{ flexDirection: 'row', gap: '$2' }}>
            {onPreview != null && reportData != null && (
              <Pressable
                onPress={() => onPreview(reportData)}
                sx={{
                  borderRadius: '$lg',
                  borderWidth: 1,
                  borderColor: 'purple300',
                  px: '$4',
                  py: '$2',
                }}
              >
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'purple600' }}>Preview</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleDownloadPdf}
              sx={{ borderRadius: '$lg', bg: 'purple600', px: '$4', py: '$2' }}
            >
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Download PDF</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
