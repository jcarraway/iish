import { View, Text, Pressable, ScrollView } from 'dripsy';

interface TimelineEntry {
  status: string;
  label: string;
  date: string | null;
  completed: boolean;
  current: boolean;
}

interface OrderTimelineProps {
  timeline: TimelineEntry[];
  onStepClick?: (status: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  completed: { bg: 'green500', border: 'green500', text: 'green700' },
  current: { bg: 'blue500', border: 'blue500', text: 'blue700' },
  upcoming: { bg: 'gray200', border: 'gray300', text: 'gray400' },
};

function getStepState(entry: TimelineEntry): 'completed' | 'current' | 'upcoming' {
  if (entry.completed) return 'completed';
  if (entry.current) return 'current';
  return 'upcoming';
}

export function OrderTimeline({ timeline, onStepClick }: OrderTimelineProps) {
  return (
    <ScrollView horizontal sx={{ pb: '$2' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', minWidth: 640 }}>
        {timeline.map((entry, idx) => {
          const state = getStepState(entry);
          const colors = STATUS_COLORS[state];
          const isLast = idx === timeline.length - 1;

          const circleContent = (
            <View sx={{ alignItems: 'center' }}>
              <View
                sx={{
                  height: 32,
                  width: 32,
                  borderRadius: '$full',
                  borderWidth: 2,
                  borderColor: colors.border,
                  bg: colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {state === 'completed' ? (
                  <Text sx={{ fontSize: '$sm', color: 'white' }}>{'\u2713'}</Text>
                ) : state === 'current' ? (
                  <View sx={{ height: 10, width: 10, borderRadius: '$full', bg: 'white' }} />
                ) : (
                  <View sx={{ height: 10, width: 10, borderRadius: '$full', bg: 'gray400' }} />
                )}
              </View>
              <Text
                sx={{
                  mt: '$2',
                  fontSize: '$xs',
                  fontWeight: '500',
                  textAlign: 'center',
                  maxWidth: 80,
                  color: colors.text,
                }}
              >
                {entry.label}
              </Text>
              {entry.date && (
                <Text sx={{ mt: 2, fontSize: 10, color: 'gray400' }}>
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              )}
            </View>
          );

          return (
            <View key={entry.status} sx={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
              {onStepClick ? (
                <Pressable onPress={() => onStepClick(entry.status)}>
                  {circleContent}
                </Pressable>
              ) : (
                circleContent
              )}
              {!isLast && (
                <View sx={{ flex: 1, mt: 16, mx: '$1' }}>
                  <View
                    sx={{
                      height: 2,
                      width: '100%',
                      bg: state === 'completed' ? 'green500' : 'gray200',
                    }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
