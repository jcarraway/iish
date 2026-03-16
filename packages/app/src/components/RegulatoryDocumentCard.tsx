import { View, Text, Pressable } from 'dripsy';

interface RegulatoryDocumentCardProps {
  id: string;
  documentType: string;
  title: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  onView: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'gray100', text: 'gray600' },
  physician_reviewed: { label: 'Physician Reviewed', bg: 'blue100', text: 'blue700' },
  patient_signed: { label: 'Patient Signed', bg: 'amber100', text: 'amber700' },
  submitted: { label: 'Submitted', bg: 'green100', text: 'green700' },
};

const STATUS_ACTIONS: Record<string, { label: string; next: string }> = {
  draft: { label: 'Mark as Physician Reviewed', next: 'physician_reviewed' },
  physician_reviewed: { label: 'Mark as Patient Signed', next: 'patient_signed' },
  patient_signed: { label: 'Mark as Submitted', next: 'submitted' },
};

const TYPE_LABELS: Record<string, string> = {
  fda_form_3926: 'FDA Form 3926',
  right_to_try_checklist: 'Right to Try Checklist',
  informed_consent: 'Informed Consent',
  physician_letter: 'Physician Letter',
  ind_application: 'IND Application',
  irb_protocol: 'IRB Protocol',
  manufacturer_request: 'Manufacturer Request',
  physician_discussion_guide: 'Discussion Guide',
};

export function RegulatoryDocumentCard({
  id,
  documentType,
  title,
  status,
  createdAt,
  reviewedAt,
  reviewedBy,
  onView,
  onUpdateStatus,
}: RegulatoryDocumentCardProps) {
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.draft;
  const action = STATUS_ACTIONS[status];
  const typeLabel = TYPE_LABELS[documentType] ?? documentType;

  return (
    <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'gray200', p: '$4' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '$2' }}>
        <View sx={{ flex: 1 }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2', flexWrap: 'wrap' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900', fontSize: '$sm' }}>{title}</Text>
            <View sx={{ borderRadius: '$sm', bg: badge.bg, px: 6, py: 2 }}>
              <Text sx={{ fontSize: 10, fontWeight: '500', color: badge.text }}>{badge.label}</Text>
            </View>
          </View>
          <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
            {typeLabel} {'\u00B7'} Created {new Date(createdAt).toLocaleDateString()}
          </Text>
          {reviewedAt && (
            <Text sx={{ mt: 2, fontSize: '$xs', color: 'gray500' }}>
              Reviewed {new Date(reviewedAt).toLocaleDateString()}
              {reviewedBy && ` by ${reviewedBy}`}
            </Text>
          )}
        </View>
      </View>

      <View sx={{ mt: '$3', flexDirection: 'row', gap: '$2' }}>
        <Pressable
          onPress={() => onView(id)}
          sx={{ borderRadius: '$lg', bg: 'blue600', px: '$3', py: 6 }}
        >
          <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>View</Text>
        </Pressable>
        {action && onUpdateStatus && (
          <Pressable
            onPress={() => onUpdateStatus(id, action.next)}
            sx={{
              borderRadius: '$lg',
              borderWidth: 1,
              borderColor: 'gray300',
              px: '$3',
              py: 6,
            }}
          >
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>{action.label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
