'use client';

interface AEReport {
  reportType: string;
  daysPostAdministration: number;
  hasAdverseEvents: boolean;
  adverseEvents: { event: string; severity: string; resolved?: boolean }[] | null;
  createdAt: string;
}

interface AdverseEventSummaryProps {
  reports: AEReport[];
}

const SEVERITY_COLORS: Record<string, string> = {
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  severe: 'bg-red-100 text-red-800',
  life_threatening: 'bg-red-200 text-red-900',
};

export default function AdverseEventSummary({ reports }: AdverseEventSummaryProps) {
  const reportsWithAE = reports.filter((r) => r.hasAdverseEvents && r.adverseEvents);

  if (reportsWithAE.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">No adverse events reported</p>
        <p className="mt-1 text-xs text-green-600">
          {reports.length} report{reports.length !== 1 ? 's' : ''} submitted with no adverse events.
        </p>
      </div>
    );
  }

  // Aggregate events across all reports
  const eventMap = new Map<string, { count: number; maxSeverity: string; firstSeen: number; lastSeen: number; resolved: boolean }>();

  for (const report of reportsWithAE) {
    for (const ae of report.adverseEvents ?? []) {
      const existing = eventMap.get(ae.event);
      const severityRank: Record<string, number> = { mild: 0, moderate: 1, severe: 2, life_threatening: 3 };
      if (existing) {
        existing.count++;
        if ((severityRank[ae.severity] ?? 0) > (severityRank[existing.maxSeverity] ?? 0)) {
          existing.maxSeverity = ae.severity;
        }
        existing.lastSeen = Math.max(existing.lastSeen, report.daysPostAdministration);
        if (ae.resolved) existing.resolved = true;
      } else {
        eventMap.set(ae.event, {
          count: 1,
          maxSeverity: ae.severity,
          firstSeen: report.daysPostAdministration,
          lastSeen: report.daysPostAdministration,
          resolved: ae.resolved ?? false,
        });
      }
    }
  }

  const events = Array.from(eventMap.entries()).sort(
    (a, b) => {
      const severityRank: Record<string, number> = { mild: 0, moderate: 1, severe: 2, life_threatening: 3 };
      return (severityRank[b[1].maxSeverity] ?? 0) - (severityRank[a[1].maxSeverity] ?? 0);
    },
  );

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900">Adverse Events Summary</h3>
      <p className="mt-1 text-xs text-gray-500">
        {reportsWithAE.length} of {reports.length} reports included adverse events
      </p>

      <div className="mt-4 space-y-2">
        {events.map(([event, data]) => (
          <div key={event} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[data.maxSeverity] ?? 'bg-gray-100 text-gray-700'}`}>
                {data.maxSeverity.replace('_', ' ')}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">{event}</p>
                <p className="text-xs text-gray-500">
                  Reported {data.count}x &middot; Day {data.firstSeen}
                  {data.lastSeen !== data.firstSeen && ` — Day ${data.lastSeen}`}
                </p>
              </div>
            </div>
            {data.resolved && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Resolved
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
