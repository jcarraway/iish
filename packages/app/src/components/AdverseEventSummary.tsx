import { View, Text } from 'dripsy';

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

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  mild: { bg: 'yellow100', text: 'yellow800' },
  moderate: { bg: 'orange100', text: 'orange600' },
  severe: { bg: 'red100', text: 'red800' },
  life_threatening: { bg: 'red200', text: 'red900' },
};

export function AdverseEventSummary({ reports }: AdverseEventSummaryProps) {
  const reportsWithAE = reports.filter((r) => r.hasAdverseEvents && r.adverseEvents);

  if (reportsWithAE.length === 0) {
    return (
      <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'green200', bg: 'green50', p: '$4' }}>
        <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'green800' }}>
          No adverse events reported
        </Text>
        <Text sx={{ mt: '$1', fontSize: '$xs', color: 'green600' }}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} submitted with no adverse events.
        </Text>
      </View>
    );
  }

  const eventMap = new Map<
    string,
    { count: number; maxSeverity: string; firstSeen: number; lastSeen: number; resolved: boolean }
  >();

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

  const events = Array.from(eventMap.entries()).sort((a, b) => {
    const severityRank: Record<string, number> = { mild: 0, moderate: 1, severe: 2, life_threatening: 3 };
    return (severityRank[b[1].maxSeverity] ?? 0) - (severityRank[a[1].maxSeverity] ?? 0);
  });

  return (
    <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
      <Text sx={{ fontWeight: '600', color: 'gray900' }}>Adverse Events Summary</Text>
      <Text sx={{ mt: '$1', fontSize: '$xs', color: 'gray500' }}>
        {reportsWithAE.length} of {reports.length} reports included adverse events
      </Text>

      <View sx={{ mt: '$4', gap: '$2' }}>
        {events.map(([event, data]) => {
          const colors = SEVERITY_COLORS[data.maxSeverity] ?? { bg: 'gray100', text: 'gray700' };
          return (
            <View
              key={event}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray100',
                p: '$3',
              }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', flex: 1 }}>
                <View sx={{ borderRadius: '$full', bg: colors.bg, px: '$2', py: 2 }}>
                  <Text sx={{ fontSize: '$xs', fontWeight: '500', color: colors.text }}>
                    {data.maxSeverity.replace('_', ' ')}
                  </Text>
                </View>
                <View>
                  <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray900' }}>{event}</Text>
                  <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
                    Reported {data.count}x {'\u00B7'} Day {data.firstSeen}
                    {data.lastSeen !== data.firstSeen && ` \u2014 Day ${data.lastSeen}`}
                  </Text>
                </View>
              </View>
              {data.resolved && (
                <View sx={{ borderRadius: '$full', bg: 'green100', px: '$2', py: 2 }}>
                  <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'green700' }}>Resolved</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
