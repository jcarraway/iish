import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';
import { MonitoringReportForm } from '../components';
import type { ReportFormData } from '../components';
import type { MonitoringReportType } from '@oncovax/shared';
import {
  useGetMonitoringScheduleQuery,
  useSubmitMonitoringReportMutation,
} from '../generated/graphql';

export function MonitoringReportScreen({
  orderId,
  reportTypeParam,
}: {
  orderId: string;
  reportTypeParam?: string;
}) {
  const router = useRouter();
  const { data: scheduleData, loading: scheduleLoading } = useGetMonitoringScheduleQuery({
    variables: { orderId },
  });
  const [submitReport, { loading: submitting }] = useSubmitMonitoringReportMutation();

  const [reportType, setReportType] = useState<MonitoringReportType | null>(
    (reportTypeParam as MonitoringReportType) ?? null,
  );
  const [submitted, setSubmitted] = useState(false);
  const [escalation, setEscalation] = useState<{ requiresEscalation: boolean; reason: string | null } | null>(null);

  // Auto-detect next due report if no type param
  useEffect(() => {
    if (reportType) return;
    if (!scheduleData?.monitoringSchedule) return;
    const schedule = scheduleData.monitoringSchedule;
    const nextDue =
      schedule.find((s) => s.status === 'overdue' || s.status === 'due_today') ??
      schedule.find((s) => s.status === 'upcoming');
    if (nextDue) setReportType(nextDue.reportType as MonitoringReportType);
  }, [scheduleData, reportType]);

  const handleSubmit = async (formData: ReportFormData) => {
    try {
      const { data } = await submitReport({
        variables: {
          input: {
            orderId,
            reportType: formData.reportType,
            daysPostAdministration: 0,
            adverseEvents: formData.adverseEvents,
            temperature: formData.temperature,
            bloodPressure: formData.bloodPressure,
            heartRate: formData.heartRate,
            qualityOfLifeScore: formData.qualityOfLifeScore,
            tumorResponse: formData.tumorResponse,
            narrative: formData.narrative,
          },
        },
      });
      if (data?.submitMonitoringReport) {
        // Check for AE escalation
        const hasSerious = formData.adverseEvents?.some(
          (ae) => ae.severity === 'severe' || ae.severity === 'life_threatening',
        );
        setEscalation(
          hasSerious
            ? { requiresEscalation: true, reason: 'You reported severe adverse events. Your care team has been notified and will follow up.' }
            : null,
        );
        setSubmitted(true);
      }
    } catch {}
  };

  if (scheduleLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <ActivityIndicator size="small" />
        <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Loading...</Text>
      </View>
    );
  }

  if (submitted) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
          <View sx={{ borderWidth: 2, borderColor: 'green200', bg: 'green50', borderRadius: '$xl', p: '$8', alignItems: 'center' }}>
            <Text sx={{ fontSize: 48 }}>&#10003;</Text>
            <Text sx={{ mt: '$4', fontSize: '$xl', fontWeight: '700', color: 'green900' }}>
              Report Submitted
            </Text>
            <Text sx={{ mt: '$2', fontSize: '$sm', color: 'green800', textAlign: 'center' }}>
              Thank you for your check-in. Your care team has been notified.
            </Text>
          </View>

          {escalation?.requiresEscalation && (
            <View sx={{ mt: '$6', borderWidth: 2, borderColor: 'red200', bg: 'red50', borderRadius: '$xl', p: '$5' }}>
              <Text sx={{ fontWeight: '600', color: 'red900' }}>Important Notice</Text>
              <Text sx={{ mt: '$2', fontSize: '$sm', color: 'red800' }}>{escalation.reason}</Text>
              <Text sx={{ mt: '$2', fontSize: '$sm', color: 'red700' }}>
                Please contact your physician or seek medical attention if you are experiencing severe
                symptoms.
              </Text>
            </View>
          )}

          <View sx={{ mt: '$6', flexDirection: 'row', gap: 12 }}>
            <Link href={`/manufacture/monitoring/${orderId}/history`}>
              <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$lg', px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>View history</Text>
              </View>
            </Link>
            <Link href="/manufacture/monitoring">
              <View sx={{ bg: 'blue600', borderRadius: '$lg', px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Back to monitoring</Text>
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!reportType) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ color: 'gray600' }}>No pending reports for this order.</Text>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>Submit Check-In</Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Report how you&apos;re feeling after your vaccine administration
        </Text>

        <View sx={{ mt: '$8' }}>
          <MonitoringReportForm
            orderId={orderId}
            reportType={reportType}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
