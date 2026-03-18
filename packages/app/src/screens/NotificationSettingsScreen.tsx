import { useState } from 'react';
import { View, Text, ScrollView } from 'dripsy';
import { Switch, TextInput, ActivityIndicator } from 'react-native';
import {
  useGetNotificationPreferencesQuery,
  useGetNotificationHistoryQuery,
  useUpdateNotificationPreferencesMutation,
} from '../generated/graphql';
import { Picker } from '../components/Picker';

const TOGGLE_ROWS = [
  { key: 'surveillanceReminders', label: 'Surveillance Reminders', desc: 'Get notified before upcoming appointments and when they\'re overdue' },
  { key: 'journalReminders', label: 'Journal Reminders', desc: 'Gentle nudge to log how you\'re feeling (frequency adjusts with your phase)' },
  { key: 'weeklySummary', label: 'Weekly Summary', desc: 'Monday recap of your journal trends and upcoming events' },
  { key: 'appointmentPrep', label: 'Appointment Prep', desc: 'Receive a prep document 3 days before appointments' },
  { key: 'ctdnaResults', label: 'ctDNA Updates', desc: 'Notifications about ctDNA monitoring and results' },
  { key: 'scpAnnualReview', label: 'Annual Plan Review', desc: 'Yearly reminder to review your updated survivorship care plan' },
  { key: 'lifestyleCheckIn', label: 'Lifestyle Check-In', desc: 'Monthly wellness check-in and lifestyle recommendation refresh' },
  { key: 'phaseTransitions', label: 'Phase Milestones', desc: 'Get notified when you reach a new survivorship milestone' },
] as const;

const TIMEZONE_OPTIONS = [
  { label: 'Eastern (ET)', value: 'America/New_York' },
  { label: 'Central (CT)', value: 'America/Chicago' },
  { label: 'Mountain (MT)', value: 'America/Denver' },
  { label: 'Pacific (PT)', value: 'America/Los_Angeles' },
  { label: 'Alaska (AKT)', value: 'America/Anchorage' },
  { label: 'Hawaii (HT)', value: 'Pacific/Honolulu' },
];

export function NotificationSettingsScreen() {
  const { data: prefsData, loading: prefsLoading } = useGetNotificationPreferencesQuery();
  const { data: historyData, loading: historyLoading } = useGetNotificationHistoryQuery({
    variables: { limit: 20 },
    errorPolicy: 'ignore',
  });
  const [updatePrefs] = useUpdateNotificationPreferencesMutation();

  const prefs = prefsData?.notificationPreferences;
  const history = historyData?.notificationHistory ?? [];

  const [localPrefs, setLocalPrefs] = useState<Record<string, any>>({});

  const getPrefsValue = (key: string): boolean => {
    if (key in localPrefs) return localPrefs[key];
    return (prefs as any)?.[key] ?? true;
  };

  const handleToggle = async (key: string, value: boolean) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    try {
      await updatePrefs({ variables: { input: { [key]: value } } });
    } catch {
      setLocalPrefs(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleQuietHours = async (field: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setLocalPrefs(prev => ({ ...prev, [field]: value }));
    if (/^\d{2}:\d{2}$/.test(value)) {
      try {
        await updatePrefs({ variables: { input: { [field]: value } } });
      } catch {
        // swallow
      }
    }
  };

  const handleTimezone = async (value: string) => {
    setLocalPrefs(prev => ({ ...prev, timezone: value }));
    try {
      await updatePrefs({ variables: { input: { timezone: value } } });
    } catch {
      // swallow
    }
  };

  if (prefsLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Notification Settings</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Notification Settings</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Choose which email notifications you'd like to receive
        </Text>

        {/* Toggle rows */}
        <View sx={{ mt: '$6', gap: '$1' }}>
          {TOGGLE_ROWS.map(row => (
            <View
              key={row.key}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: '$4',
                borderBottomWidth: 1,
                borderColor: '$border',
              }}
            >
              <View sx={{ flex: 1, mr: '$4' }}>
                <Text sx={{ fontSize: 14, fontWeight: '500', color: '$foreground' }}>
                  {row.label}
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground', mt: 2 }}>
                  {row.desc}
                </Text>
              </View>
              <Switch
                value={getPrefsValue(row.key)}
                onValueChange={(val) => handleToggle(row.key, val)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={getPrefsValue(row.key) ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          ))}
        </View>

        {/* Quiet hours */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Quiet Hours</Text>
          <Text sx={{ mt: '$1', fontSize: 12, color: '$mutedForeground' }}>
            No notifications during these hours (HH:MM format, 24-hour)
          </Text>
          <View sx={{ mt: '$3', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: 4 }}>From</Text>
              <TextInput
                value={localPrefs.quietHoursStart ?? prefs?.quietHoursStart ?? ''}
                onChangeText={(v) => handleQuietHours('quietHoursStart', v)}
                placeholder="22:00"
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 14,
                }}
                maxLength={5}
              />
            </View>
            <Text sx={{ mt: '$4', color: '$mutedForeground' }}>to</Text>
            <View sx={{ flex: 1 }}>
              <Text sx={{ fontSize: 12, color: '$mutedForeground', mb: 4 }}>Until</Text>
              <TextInput
                value={localPrefs.quietHoursEnd ?? prefs?.quietHoursEnd ?? ''}
                onChangeText={(v) => handleQuietHours('quietHoursEnd', v)}
                placeholder="08:00"
                style={{
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 14,
                }}
                maxLength={5}
              />
            </View>
          </View>
        </View>

        {/* Timezone */}
        <View sx={{ mt: '$6' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Timezone</Text>
          <View sx={{ mt: '$2' }}>
            <Picker
              value={localPrefs.timezone ?? prefs?.timezone ?? 'America/New_York'}
              onValueChange={handleTimezone}
              options={TIMEZONE_OPTIONS}
            />
          </View>
        </View>

        {/* Recent notifications */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 16, fontWeight: '600', color: '$foreground' }}>Recent Notifications</Text>
          {historyLoading ? (
            <View sx={{ mt: '$4', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 13, color: '$mutedForeground' }}>Loading...</Text>
            </View>
          ) : history.length === 0 ? (
            <Text sx={{ mt: '$3', fontSize: 13, color: '$mutedForeground' }}>
              No notifications sent yet.
            </Text>
          ) : (
            <View sx={{ mt: '$3', gap: '$2' }}>
              {history.map((entry) => (
                <View
                  key={entry.id}
                  sx={{
                    borderWidth: 1,
                    borderColor: '$border',
                    borderRadius: 8,
                    p: '$3',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '$3',
                  }}
                >
                  <View sx={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: categoryColor(entry.category),
                  }} />
                  <View sx={{ flex: 1 }}>
                    <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }} numberOfLines={1}>
                      {entry.subject || entry.category.replace(/_/g, ' ')}
                    </Text>
                    <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>
                      {new Date(entry.sentAt).toLocaleDateString()} {new Date(entry.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    surveillance_reminder: '#3B82F6',
    surveillance_overdue: '#EF4444',
    journal_reminder: '#8B5CF6',
    weekly_summary: '#10B981',
    appointment_prep: '#F59E0B',
    scp_annual_review: '#6366F1',
    lifestyle_checkin: '#14B8A6',
    phase_transition: '#EC4899',
  };
  return colors[category] || '#6B7280';
}
