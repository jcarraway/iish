import type { MonitoringReportType, AdverseEventSeverity } from '@oncovax/shared';
import { MONITORING_SCHEDULE } from './providers';

export interface ScheduleEntry {
  reportType: MonitoringReportType;
  daysAfter: number;
  required: boolean;
  description: string;
  dueDate: Date;
  status: 'completed' | 'overdue' | 'due_today' | 'upcoming';
  submittedAt?: string;
}

export function getMonitoringSchedule(
  administeredAt: string | Date,
  submittedReports: { reportType: string; createdAt: string }[],
): ScheduleEntry[] {
  const adminDate = new Date(administeredAt);
  const now = new Date();
  const submittedSet = new Map(
    submittedReports.map((r) => [r.reportType, r.createdAt]),
  );

  return MONITORING_SCHEDULE.map((item) => {
    const dueDate = new Date(adminDate);
    dueDate.setDate(dueDate.getDate() + item.daysAfter);

    const submitted = submittedSet.get(item.reportType);
    let status: ScheduleEntry['status'];

    if (submitted) {
      status = 'completed';
    } else if (dueDate.toDateString() === now.toDateString()) {
      status = 'due_today';
    } else if (dueDate < now) {
      status = 'overdue';
    } else {
      status = 'upcoming';
    }

    return {
      ...item,
      dueDate,
      status,
      submittedAt: submitted ?? undefined,
    };
  });
}

export function checkAdverseEventEscalation(adverseEvents: { severity: AdverseEventSeverity }[]): {
  requiresEscalation: boolean;
  reason: string | null;
} {
  const severe = adverseEvents.filter(
    (ae) => ae.severity === 'severe' || ae.severity === 'life_threatening',
  );

  if (severe.length > 0) {
    return {
      requiresEscalation: true,
      reason: `${severe.length} severe/life-threatening adverse event(s) reported — immediate physician notification recommended`,
    };
  }

  return { requiresEscalation: false, reason: null };
}

export interface AdverseEventOption {
  event: string;
  category: 'injection_site' | 'systemic' | 'serious';
}

export const ADVERSE_EVENT_OPTIONS: AdverseEventOption[] = [
  // Injection site
  { event: 'Injection site pain', category: 'injection_site' },
  { event: 'Injection site swelling', category: 'injection_site' },
  { event: 'Injection site redness', category: 'injection_site' },
  { event: 'Injection site warmth', category: 'injection_site' },
  { event: 'Injection site itching', category: 'injection_site' },
  // Systemic
  { event: 'Fatigue', category: 'systemic' },
  { event: 'Headache', category: 'systemic' },
  { event: 'Muscle pain', category: 'systemic' },
  { event: 'Joint pain', category: 'systemic' },
  { event: 'Chills', category: 'systemic' },
  { event: 'Fever', category: 'systemic' },
  { event: 'Nausea', category: 'systemic' },
  { event: 'Diarrhea', category: 'systemic' },
  { event: 'Lymph node swelling', category: 'systemic' },
  // Serious
  { event: 'Difficulty breathing', category: 'serious' },
  { event: 'Chest pain', category: 'serious' },
  { event: 'Severe allergic reaction', category: 'serious' },
  { event: 'Seizure', category: 'serious' },
  { event: 'Loss of consciousness', category: 'serious' },
];
