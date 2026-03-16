import { View, Text, Pressable } from 'dripsy';

interface ScheduleEntry {
  reportType: string;
  daysAfter: number;
  required: boolean;
  description: string;
  dueDate: Date;
  status: 'completed' | 'overdue' | 'due_today' | 'upcoming';
  submittedAt?: string;
}

interface MonitoringScheduleWidgetProps {
  schedule: ScheduleEntry[];
  onSubmitReport?: (reportType: string) => void;
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  completed: { icon: '\u2713', color: 'green600', bg: 'green100' },
  due_today: { icon: '!', color: 'blue600', bg: 'blue100' },
  overdue: { icon: '!', color: 'red600', bg: 'red100' },
  upcoming: { icon: '\u2022', color: 'gray400', bg: 'gray100' },
};

export function MonitoringScheduleWidget({ schedule, onSubmitReport }: MonitoringScheduleWidgetProps) {
  const overdueCount = schedule.filter((s) => s.status === 'overdue').length;

  return (
    <View sx={{ borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text sx={{ fontWeight: '600', color: 'gray900' }}>Monitoring Schedule</Text>
        {overdueCount > 0 && (
          <View sx={{ borderRadius: '$full', bg: 'red100', px: 10, py: 2 }}>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'red700' }}>
              {overdueCount} overdue
            </Text>
          </View>
        )}
      </View>

      <View sx={{ mt: '$4', gap: '$2' }}>
        {schedule.map((entry) => {
          const config = STATUS_CONFIG[entry.status];
          return (
            <View
              key={entry.reportType}
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '$lg',
                p: '$3',
                bg:
                  entry.status === 'overdue'
                    ? 'red50'
                    : entry.status === 'due_today'
                      ? 'blue50'
                      : 'transparent',
              }}
            >
              <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3', flex: 1 }}>
                <View
                  sx={{
                    height: 24,
                    width: 24,
                    borderRadius: '$full',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: config.bg,
                  }}
                >
                  <Text sx={{ fontSize: '$xs', fontWeight: '700', color: config.color }}>
                    {config.icon}
                  </Text>
                </View>
                <View sx={{ flex: 1 }}>
                  <Text
                    sx={{
                      fontSize: '$sm',
                      fontWeight: '500',
                      color: entry.status === 'upcoming' ? 'gray400' : 'gray900',
                    }}
                  >
                    {entry.description}
                  </Text>
                  <Text sx={{ fontSize: '$xs', color: 'gray500' }}>
                    {entry.status === 'completed' && entry.submittedAt
                      ? `Submitted ${new Date(entry.submittedAt).toLocaleDateString()}`
                      : `Due ${entry.dueDate.toLocaleDateString()}`}
                    {entry.required ? ' \u00B7 Required' : ''}
                  </Text>
                </View>
              </View>

              {entry.status !== 'completed' && entry.status !== 'upcoming' && onSubmitReport && (
                <Pressable
                  onPress={() => onSubmitReport(entry.reportType)}
                  sx={{
                    borderRadius: '$lg',
                    px: '$3',
                    py: 6,
                    bg: entry.status === 'overdue' ? 'red600' : 'blue600',
                  }}
                >
                  <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>Submit</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
