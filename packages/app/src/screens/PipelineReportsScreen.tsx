import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { openExternalUrl } from '../utils';
import { useGenerateReportPdfMutation } from '../generated/graphql';

interface PipelineReportsScreenProps {
  jobId: string;
}

interface ReportCardProps {
  type: 'patient' | 'clinician' | 'manufacturer';
  title: string;
  description: string;
  jobId: string;
}

function ReportCard({ type, title, description, jobId }: ReportCardProps) {
  const [generatePdf, { loading }] = useGenerateReportPdfMutation();
  const [url, setUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const result = await generatePdf({
        variables: { pipelineJobId: jobId, reportType: type },
      });
      const generatedUrl = result.data?.generateReportPdf.url;
      if (generatedUrl) {
        setUrl(generatedUrl);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <View
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        padding: '$6',
        flex: 1,
        minWidth: 280,
      }}
    >
      <Text sx={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: '$2' }}>
        {title}
      </Text>
      <Text sx={{ fontSize: 14, color: '#6b7280', marginBottom: '$6', lineHeight: 20 }}>
        {description}
      </Text>

      {!url ? (
        <Pressable
          onPress={handleGenerate}
          disabled={loading}
          sx={{
            backgroundColor: loading ? '#9ca3af' : '#2563eb',
            paddingVertical: '$3',
            paddingHorizontal: '$4',
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text sx={{ color: '#ffffff', fontSize: 14, fontWeight: '500', marginLeft: '$2' }}>
                Generating...
              </Text>
            </>
          ) : (
            <Text sx={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>Generate Report</Text>
          )}
        </Pressable>
      ) : (
        <View sx={{ gap: '$3' }}>
          <Pressable
            onPress={() => openExternalUrl(url)}
            sx={{
              backgroundColor: '#10b981',
              paddingVertical: '$3',
              paddingHorizontal: '$4',
              borderRadius: 6,
              alignItems: 'center',
            }}
          >
            <Text sx={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}>Download PDF</Text>
          </Pressable>
          <Text sx={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
            Report generated successfully
          </Text>
        </View>
      )}
    </View>
  );
}

export function PipelineReportsScreen({ jobId }: PipelineReportsScreenProps) {
  return (
    <ScrollView
      sx={{
        flex: 1,
        backgroundColor: '#f9fafb',
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingVertical: 64,
      }}
    >
      <View sx={{ maxWidth: 896, width: '100%', marginHorizontal: 'auto' }}>
        {/* Back Link */}
        <Link href={`/pipeline/jobs/${jobId}`}>
          <View
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: '$6',
            }}
          >
            <Text sx={{ fontSize: 14, color: '#2563eb', fontWeight: '500' }}>
              ← Back to Job Details
            </Text>
          </View>
        </Link>

        {/* Header */}
        <View sx={{ marginBottom: '$12' }}>
          <Text
            sx={{
              fontSize: 32,
              fontWeight: '700',
              color: '#111827',
              marginBottom: '$3',
            }}
          >
            Reports
          </Text>
          <Text sx={{ fontSize: 16, color: '#6b7280', lineHeight: 24 }}>
            Generate and download comprehensive reports for patients, clinicians, and manufacturing
            partners. Each report is tailored to its specific audience with relevant clinical and
            technical details.
          </Text>
        </View>

        {/* Report Cards */}
        <View
          sx={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: '$6',
            marginBottom: '$12',
          }}
        >
          <ReportCard
            type="patient"
            title="Patient Report"
            description="A patient-friendly summary explaining neoantigens, vaccine design, and next steps in accessible language."
            jobId={jobId}
          />
          <ReportCard
            type="clinician"
            title="Clinician Report"
            description="Detailed genomic analysis, neoantigen candidates, vaccine design rationale, and clinical implications for oncologists."
            jobId={jobId}
          />
          <ReportCard
            type="manufacturer"
            title="Manufacturer Blueprint"
            description="Technical specifications including mRNA sequences, construct design, quality control criteria, and regulatory notes."
            jobId={jobId}
          />
        </View>

        {/* Info Box */}
        <View
          sx={{
            backgroundColor: '#eff6ff',
            borderLeftWidth: 4,
            borderLeftColor: '#2563eb',
            padding: '$4',
            borderRadius: 6,
          }}
        >
          <Text sx={{ fontSize: 14, fontWeight: '600', color: '#1e40af', marginBottom: '$2' }}>
            About These Reports
          </Text>
          <Text sx={{ fontSize: 14, color: '#1e3a8a', lineHeight: 20 }}>
            Reports are generated on-demand from your pipeline results. The patient report uses
            plain language, the clinician report includes detailed genomic analysis, and the
            manufacturer blueprint provides technical specifications for vaccine production. All
            reports are generated as downloadable PDFs.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
