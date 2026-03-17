import { View, Text, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { AdverseEventSummary } from '../components';
import { useGetMonitoringReportsQuery } from '../generated/graphql';

const REPORT_TYPE_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  '24hr': '24 Hours',
  '48hr': '48 Hours',
  '7day': '1 Week',
  '14day': '2 Weeks',
  '28day': '4 Weeks',
  '3month': '3 Months',
  '6month': '6 Months',
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  reviewed: { bg: 'green100', text: 'green800' },
  flagged: { bg: 'red100', text: 'red800' },
  submitted: { bg: 'gray100', text: 'gray700' },
};

export function MonitoringHistoryScreen({ orderId }: { orderId: string }) {
  const { data, loading } = useGetMonitoringReportsQuery({ variables: { orderId } });
  const reports = data?.monitoringReports ?? [];

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ActivityIndicator size="small" />
        <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Loading history...</Text>
      </View>
    );
  }

  const reportsForAE = reports.map((r) => ({
    reportType: r.reportType,
    daysPostAdministration: r.daysPostAdministration,
    createdAt: r.createdAt,
    hasAdverseEvents: r.hasAdverseEvents,
    adverseEvents: r.adverseEvents?.map((ae) => ({
      event: ae.event,
      severity: ae.severity,
      resolved: ae.resolved,
    })) ?? null,
  }));

  const qolReports = reports.filter((r) => r.qualityOfLifeScore != null);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Link href="/manufacture/monitoring">
          <Text sx={{ fontSize: '$sm', color: 'blue600' }}>&larr; Monitoring dashboard</Text>
        </Link>

        <Text sx={{ mt: '$4', fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Report History
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
        </Text>

        {/* AE Summary */}
        <View sx={{ mt: '$8' }}>
          <AdverseEventSummary reports={reportsForAE} />
        </View>

        {/* QOL trend */}
        {qolReports.length > 1 && (
          <View sx={{ mt: '$6', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
            <Text sx={{ fontWeight: '600', color: 'gray900' }}>Quality of Life Trend</Text>
            <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80 }}>
              {qolReports.map((r) => (
                <View key={r.id} sx={{ flex: 1, alignItems: 'center' }}>
                  <View
                    sx={{
                      width: '100%',
                      bg: 'blue500',
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      height: `${(r.qualityOfLifeScore! / 10) * 100}%` as any,
                    }}
                  />
                  <Text sx={{ mt: '$1', fontSize: 9, color: 'gray400' }}>
                    {REPORT_TYPE_LABELS[r.reportType] ?? r.reportType}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Individual reports */}
        <View sx={{ mt: '$6', gap: 16 }}>
          {reports.map((report) => {
            const badge = STATUS_BADGE[report.status] ?? STATUS_BADGE.submitted;
            return (
              <View key={report.id} sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
                <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View>
                    <Text sx={{ fontWeight: '600', color: 'gray900' }}>
                      {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType} Check-In
                    </Text>
                    <Text sx={{ fontSize: 11, color: 'gray500' }}>
                      Day {report.daysPostAdministration} &middot;{' '}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View sx={{ bg: badge.bg as any, borderRadius: 9999, px: '$2', py: 2 }}>
                    <Text sx={{ fontSize: 11, fontWeight: '500', color: badge.text as any }}>
                      {report.status}
                    </Text>
                  </View>
                </View>

                {/* Vitals */}
                {(report.temperature || report.bloodPressure || report.heartRate) && (
                  <View sx={{ mt: '$3', flexDirection: 'row', gap: 16 }}>
                    {report.temperature && (
                      <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Temp: {report.temperature}°F</Text>
                    )}
                    {report.bloodPressure && (
                      <Text sx={{ fontSize: '$sm', color: 'gray600' }}>BP: {report.bloodPressure}</Text>
                    )}
                    {report.heartRate && (
                      <Text sx={{ fontSize: '$sm', color: 'gray600' }}>HR: {report.heartRate} bpm</Text>
                    )}
                  </View>
                )}

                {/* QOL */}
                {report.qualityOfLifeScore != null && (
                  <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
                    Quality of life: <Text sx={{ fontWeight: '500' }}>{report.qualityOfLifeScore}/10</Text>
                  </Text>
                )}

                {/* AEs */}
                {report.hasAdverseEvents && report.adverseEvents && (
                  <View sx={{ mt: '$3', flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {report.adverseEvents.map((ae, idx) => {
                      const isSerious = ae.severity === 'severe' || ae.severity === 'life_threatening';
                      const isMod = ae.severity === 'moderate';
                      return (
                        <View
                          key={idx}
                          sx={{
                            borderRadius: 9999,
                            px: '$2',
                            py: 2,
                            bg: isSerious ? 'red100' : isMod ? 'orange100' : 'yellow100',
                          }}
                        >
                          <Text
                            sx={{
                              fontSize: 11,
                              fontWeight: '500',
                              color: isSerious ? 'red800' : isMod ? 'orange800' : 'yellow800',
                            }}
                          >
                            {ae.event} ({ae.severity})
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Tumor response */}
                {report.tumorResponse && (
                  <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
                    Tumor response:{' '}
                    <Text sx={{ fontWeight: '500' }}>{report.tumorResponse.replace(/_/g, ' ')}</Text>
                  </Text>
                )}

                {/* Narrative */}
                {report.narrative && (
                  <Text sx={{ mt: '$3', fontSize: '$sm', color: 'gray600', fontStyle: 'italic' }}>
                    &ldquo;{report.narrative}&rdquo;
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
