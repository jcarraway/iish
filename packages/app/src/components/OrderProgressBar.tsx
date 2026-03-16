import { View, Text } from 'dripsy';
import { SEQUENCING_ORDER_STATUSES } from '@oncovax/shared';

const STATUS_STEPS = [
  { key: SEQUENCING_ORDER_STATUSES.PENDING, label: 'Pending' },
  { key: SEQUENCING_ORDER_STATUSES.INSURANCE_CHECK, label: 'Insurance' },
  { key: SEQUENCING_ORDER_STATUSES.PRIOR_AUTH, label: 'Prior Auth' },
  { key: SEQUENCING_ORDER_STATUSES.SAMPLE_NEEDED, label: 'Sample Needed' },
  { key: SEQUENCING_ORDER_STATUSES.SAMPLE_RECEIVED, label: 'Sample Received' },
  { key: SEQUENCING_ORDER_STATUSES.PROCESSING, label: 'Processing' },
  { key: SEQUENCING_ORDER_STATUSES.RESULTS_READY, label: 'Results Ready' },
  { key: SEQUENCING_ORDER_STATUSES.COMPLETED, label: 'Completed' },
];

interface OrderProgressBarProps {
  currentStatus: string;
}

export function OrderProgressBar({ currentStatus }: OrderProgressBarProps) {
  if (currentStatus === SEQUENCING_ORDER_STATUSES.CANCELLED) {
    return (
      <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
        <View sx={{ height: 12, width: 12, borderRadius: '$full', bg: 'red500' }} />
        <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'red700' }}>Cancelled</Text>
      </View>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <View key={step.key} sx={{ flex: 1, alignItems: 'center' }}>
            <View sx={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
              {i > 0 && (
                <View
                  sx={{
                    height: 2,
                    flex: 1,
                    bg: isCompleted ? 'green400' : 'gray200',
                  }}
                />
              )}
              <View
                sx={{
                  height: 16,
                  width: 16,
                  borderRadius: '$full',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bg: isCompleted ? 'green500' : isCurrent ? 'blue500' : 'gray200',
                }}
              >
                {isCompleted && (
                  <Text sx={{ fontSize: 10, color: 'white' }}>{'\u2713'}</Text>
                )}
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View
                  sx={{
                    height: 2,
                    flex: 1,
                    bg: isCompleted ? 'green400' : 'gray200',
                  }}
                />
              )}
            </View>
            <Text
              sx={{
                mt: '$1',
                fontSize: 10,
                textAlign: 'center',
                fontWeight: isCurrent ? '600' : '400',
                color: isCurrent ? 'blue700' : isCompleted ? 'green700' : 'gray400',
              }}
            >
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
