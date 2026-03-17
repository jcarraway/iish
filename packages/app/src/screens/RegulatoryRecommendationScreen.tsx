import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { PathwayRecommendation } from '../components';
import type { RegulatoryPathwayType, RegulatoryDocumentType } from '@oncovax/shared';
import {
  useGetRegulatoryAssessmentQuery,
  useGenerateRegulatoryDocumentMutation,
} from '../generated/graphql';

export function RegulatoryRecommendationScreen({ assessmentId }: { assessmentId: string }) {
  const { data, loading, error } = useGetRegulatoryAssessmentQuery({
    variables: { id: assessmentId },
    skip: !assessmentId,
  });
  const [generateDoc, { loading: generating }] = useGenerateRegulatoryDocumentMutation();

  const assessment = data?.regulatoryAssessment;

  if (!assessmentId) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'gray600' }}>No assessment found. Please complete the pathway assessment first.</Text>
        <Link href="/manufacture/regulatory/assessment">
          <Text sx={{ mt: '$4', fontSize: '$sm', color: 'purple600' }}>Start assessment &rarr;</Text>
        </Link>
      </View>
    );
  }

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !assessment) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Assessment not found'}</Text>
      </View>
    );
  }

  const handleGenerateDoc = async (docType: string) => {
    try {
      await generateDoc({
        variables: { assessmentId: assessment.id, documentType: docType },
      });
    } catch {}
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Recommended Pathway
        </Text>

        <View sx={{ mt: '$8' }}>
          <PathwayRecommendation
            recommended={assessment.recommended as RegulatoryPathwayType}
            rationale={assessment.rationale}
            alternatives={(assessment.alternatives ?? []) as { pathway: RegulatoryPathwayType; rationale: string }[]}
            requiredDocuments={assessment.requiredDocuments as RegulatoryDocumentType[]}
            estimatedCostMin={assessment.estimatedCostMin}
            estimatedCostMax={assessment.estimatedCostMax}
            estimatedTimelineWeeks={assessment.estimatedTimelineWeeks}
            assessmentId={assessment.id}
            onGenerateDocument={handleGenerateDoc as (docType: RegulatoryDocumentType) => void}
          />
        </View>

        {/* Generate documents */}
        {assessment.requiredDocuments.length > 0 && (
          <View sx={{ mt: '$8', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Generate Documents</Text>
            <Text sx={{ fontSize: '$sm', color: 'gray600', mb: '$4' }}>
              Generate the required regulatory documents for your chosen pathway.
            </Text>
            <View sx={{ gap: 8 }}>
              {assessment.requiredDocuments.map((doc) => (
                <Pressable
                  key={doc}
                  onPress={() => handleGenerateDoc(doc)}
                  disabled={generating}
                >
                  <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', p: '$3', bg: 'gray50', borderRadius: '$lg' }}>
                    <Text sx={{ fontSize: '$sm', color: 'gray700' }}>{doc.replace(/_/g, ' ')}</Text>
                    <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'purple600' }}>
                      {generating ? 'Generating...' : 'Generate'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Next steps */}
        <View sx={{ mt: '$8', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Next Steps</Text>
          <View sx={{ gap: 12 }}>
            <View sx={{ flexDirection: 'row', gap: 12 }}>
              <View sx={{ width: 24, height: 24, borderRadius: 12, bg: 'purple100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ fontSize: 12, fontWeight: '700', color: 'purple700' }}>1</Text>
              </View>
              <Text sx={{ flex: 1, fontSize: '$sm', color: 'gray700' }}>
                Review the recommendation with your oncologist
              </Text>
            </View>
            <View sx={{ flexDirection: 'row', gap: 12 }}>
              <View sx={{ width: 24, height: 24, borderRadius: 12, bg: 'purple100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ fontSize: 12, fontWeight: '700', color: 'purple700' }}>2</Text>
              </View>
              <Text sx={{ flex: 1, fontSize: '$sm', color: 'gray700' }}>
                Generate and review required documents
              </Text>
            </View>
            <View sx={{ flexDirection: 'row', gap: 12 }}>
              <View sx={{ width: 24, height: 24, borderRadius: 12, bg: 'purple100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ fontSize: 12, fontWeight: '700', color: 'purple700' }}>3</Text>
              </View>
              <Text sx={{ flex: 1, fontSize: '$sm', color: 'gray700' }}>
                Have your physician review and sign documents
              </Text>
            </View>
          </View>
        </View>

        <Link href="/manufacture/regulatory/documents">
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center' }}>
            <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>
              View all documents &rarr;
            </Text>
          </View>
        </Link>
      </View>
    </ScrollView>
  );
}
