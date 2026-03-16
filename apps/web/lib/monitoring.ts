import type { MonitoringReportType, AdverseEventSeverity } from '@oncovax/shared';
import { ADVERSE_EVENT_OPTIONS } from '@oncovax/shared';
import { MONITORING_SCHEDULE } from './providers';
export type { AdverseEventOption } from '@oncovax/shared';
export { ADVERSE_EVENT_OPTIONS };

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
