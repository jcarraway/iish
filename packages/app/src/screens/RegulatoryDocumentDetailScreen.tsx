import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, TextInput } from 'react-native';
import { Link } from 'solito/link';
import { confirmAction } from '../utils';
import {
  useGetRegulatoryDocumentQuery,
  useUpdateRegulatoryDocumentStatusMutation,
} from '../generated/graphql';

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'gray100', text: 'gray700' },
  physician_reviewed: { bg: 'blue100', text: 'blue700' },
  patient_signed: { bg: 'purple100', text: 'purple700' },
  submitted: { bg: 'green100', text: 'green700' },
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  draft: { status: 'physician_reviewed', label: 'Mark as Physician Reviewed' },
  physician_reviewed: { status: 'patient_signed', label: 'Mark as Patient Signed' },
  patient_signed: { status: 'submitted', label: 'Mark as Submitted' },
};

export function RegulatoryDocumentDetailScreen({ documentId }: { documentId: string }) {
  const { data, loading, error, refetch } = useGetRegulatoryDocumentQuery({
    variables: { id: documentId },
  });
  const [updateStatus, { loading: updating }] = useUpdateRegulatoryDocumentStatusMutation();
  const [reviewNotes, setReviewNotes] = useState('');

  const doc = data?.regulatoryDocument;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !doc) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'red600' }}>{error?.message ?? 'Document not found'}</Text>
      </View>
    );
  }

  const badge = STATUS_BADGE[doc.status] ?? STATUS_BADGE.draft;
  const nextAction = NEXT_STATUS[doc.status];

  const handleStatusUpdate = (newStatus: string) => {
    confirmAction(
      `Are you sure you want to update this document's status to "${newStatus.replace(/_/g, ' ')}"?`,
      async () => {
        try {
          await updateStatus({
            variables: {
              id: doc.id,
              status: newStatus,
              reviewNotes: reviewNotes || undefined,
            },
          });
          setReviewNotes('');
          refetch();
        } catch {}
      },
    );
  };

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/manufacture/regulatory/documents">
          <Text sx={{ fontSize: '$sm', color: 'blue600', mb: '$6' }}>&larr; All documents</Text>
        </Link>

        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 12, mb: '$2' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>
            {doc.documentType.replace(/_/g, ' ')}
          </Text>
          <View sx={{ bg: badge.bg as any, borderRadius: 9999, px: '$2', py: 2 }}>
            <Text sx={{ fontSize: 11, fontWeight: '500', color: badge.text as any }}>
              {doc.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>

        <Text sx={{ fontSize: 11, color: 'gray400' }}>
          Created {new Date(doc.createdAt).toLocaleDateString()}
        </Text>

        {/* Document content */}
        <View sx={{ mt: '$6', bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
          <Text sx={{ fontSize: '$sm', color: 'gray800', fontFamily: 'monospace' }}>
            {doc.content}
          </Text>
        </View>

        {/* Review notes */}
        {doc.reviewNotes && (
          <View sx={{ mt: '$6', bg: 'blue50', borderWidth: 1, borderColor: 'blue200', borderRadius: '$lg', p: '$4' }}>
            <Text sx={{ fontWeight: '600', color: 'blue900', mb: '$1' }}>Review Notes</Text>
            <Text sx={{ fontSize: '$sm', color: 'blue800' }}>{doc.reviewNotes}</Text>
            {doc.reviewedAt && (
              <Text sx={{ mt: '$2', fontSize: 11, color: 'blue600' }}>
                Reviewed {new Date(doc.reviewedAt).toLocaleDateString()}
                {doc.reviewedBy ? ` by ${doc.reviewedBy}` : ''}
              </Text>
            )}
          </View>
        )}

        {/* Status update */}
        {nextAction && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', mb: '$3' }}>Update Status</Text>
            <TextInput
              value={reviewNotes}
              onChangeText={setReviewNotes}
              multiline
              numberOfLines={3}
              placeholder="Add review notes (optional)..."
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                minHeight: 80,
                textAlignVertical: 'top',
                marginBottom: 12,
              }}
            />
            <Pressable
              onPress={() => handleStatusUpdate(nextAction.status)}
              disabled={updating}
            >
              <View sx={{ bg: 'purple600', borderRadius: '$lg', px: '$6', py: '$3', alignItems: 'center', opacity: updating ? 0.5 : 1 }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
                  {updating ? 'Updating...' : nextAction.label}
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
