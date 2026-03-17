import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { RegulatoryDocumentCard } from '../components';
import {
  useGetRegulatoryAssessmentsQuery,
  useGetRegulatoryDocumentsQuery,
} from '../generated/graphql';

const STATUS_FLOW = [
  { status: 'draft', label: 'Draft', color: 'gray' },
  { status: 'physician_reviewed', label: 'Physician Reviewed', color: 'blue' },
  { status: 'patient_signed', label: 'Patient Signed', color: 'purple' },
  { status: 'submitted', label: 'Submitted', color: 'green' },
];

export function RegulatoryDocumentsScreen() {
  const { data: assessmentData } = useGetRegulatoryAssessmentsQuery();
  const latestAssessment = assessmentData?.regulatoryAssessments?.[0];

  const { data, loading } = useGetRegulatoryDocumentsQuery({
    variables: { assessmentId: latestAssessment?.id ?? '' },
    skip: !latestAssessment?.id,
  });

  const documents = data?.regulatoryDocuments ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Regulatory Documents
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Generated documents for your regulatory pathway. Each document must be reviewed by your
          physician before submission.
        </Text>

        {/* Status workflow legend */}
        <View sx={{ mt: '$6', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {STATUS_FLOW.map((step, idx) => (
            <View key={step.status} sx={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View sx={{ width: 8, height: 8, borderRadius: 4, bg: `${step.color}500` as any }} />
              <Text sx={{ fontSize: 11, color: 'gray500' }}>
                {idx + 1}. {step.label}
              </Text>
            </View>
          ))}
        </View>

        {documents.length === 0 ? (
          <View sx={{ mt: '$8', alignItems: 'center', py: '$16', bg: 'gray50', borderRadius: '$xl' }}>
            <Text sx={{ fontWeight: '500', color: 'gray900' }}>No documents generated yet</Text>
            <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray500', textAlign: 'center', px: '$4' }}>
              Complete a pathway assessment to generate the required regulatory documents.
            </Text>
            <Link href="/manufacture/regulatory/assessment">
              <View sx={{ mt: '$4', bg: 'purple600', borderRadius: '$lg', px: '$6', py: '$3' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>Start assessment</Text>
              </View>
            </Link>
          </View>
        ) : (
          <View sx={{ mt: '$6', gap: '$4' }}>
            {documents.map((doc) => (
              <RegulatoryDocumentCard
                key={doc.id}
                id={doc.id}
                documentType={doc.documentType}
                title={doc.documentType.replace(/_/g, ' ')}
                status={doc.status}
                createdAt={doc.createdAt}
                reviewedAt={doc.reviewedAt ?? null}
                reviewedBy={doc.reviewedBy ?? null}
                onView={() => {}}
              />
            ))}
          </View>
        )}

        <View sx={{ mt: '$8', p: '$4', bg: 'yellow50', borderWidth: 1, borderColor: 'yellow200', borderRadius: '$lg' }}>
          <Text sx={{ fontSize: 11, color: 'yellow800' }}>
            <Text sx={{ fontWeight: '700' }}>Important:</Text> All documents are AI-generated
            drafts and must be reviewed, edited, and approved by a licensed physician before
            submission to any regulatory body.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
