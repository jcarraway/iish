'use client';

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

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  physician_reviewed: { label: 'Physician Reviewed', className: 'bg-blue-100 text-blue-700' },
  patient_signed: { label: 'Patient Signed', className: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', className: 'bg-green-100 text-green-700' },
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

export default function RegulatoryDocumentCard({
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
    <div className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {typeLabel} &middot; Created {new Date(createdAt).toLocaleDateString()}
          </p>
          {reviewedAt && (
            <p className="mt-0.5 text-xs text-gray-500">
              Reviewed {new Date(reviewedAt).toLocaleDateString()}
              {reviewedBy && ` by ${reviewedBy}`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onView(id)}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          View
        </button>
        {action && onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus(id, action.next)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
