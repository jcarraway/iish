import { View, Text } from 'dripsy';
import { PIPELINE_STEP_ORDER } from '@oncovax/shared';

const STEP_LABELS: Record<string, string> = {
  alignment: 'Alignment',
  variant_calling: 'Variant Calling',
  hla_typing: 'HLA Typing',
  peptide_generation: 'Peptide Generation',
  neoantigen_prediction: 'Neoantigen Prediction',
  structure_prediction: 'Structure Prediction',
  ranking: 'Ranking',
  mrna_design: 'mRNA Design',
};

interface PipelineProgressBarProps {
  currentStep: string | null;
  stepsCompleted: string[];
  status: string;
}

export function PipelineProgressBar({ currentStep, stepsCompleted, status }: PipelineProgressBarProps) {
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  return (
    <View sx={{ width: '100%' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {PIPELINE_STEP_ORDER.map((step, i) => {
          const isCompleted = stepsCompleted.includes(step);
          const isCurrent = currentStep === step;
          const isFailedStep = isFailed && isCurrent;

          let bgColor: string = 'gray200';
          let textColor: string = 'gray400';

          if (isCompleted) {
            bgColor = 'green500';
            textColor = 'green700';
          } else if (isFailedStep) {
            bgColor = 'red500';
            textColor = 'red700';
          } else if (isCurrent && !isCancelled) {
            bgColor = 'blue500';
            textColor = 'blue700';
          }

          return (
            <View key={step} sx={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View sx={{ alignItems: 'center' }}>
                <View
                  sx={{
                    height: 32,
                    width: 32,
                    borderRadius: '$full',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: bgColor,
                    ...(isFailedStep
                      ? { borderWidth: 2, borderColor: 'red300' }
                      : isCurrent && !isCancelled && !isFailed
                        ? { borderWidth: 2, borderColor: 'blue300' }
                        : {}),
                  }}
                >
                  {isCompleted ? (
                    <Text sx={{ fontSize: '$sm', color: 'white' }}>{'\u2713'}</Text>
                  ) : isFailedStep ? (
                    <Text sx={{ fontSize: '$sm', color: 'white' }}>{'\u2717'}</Text>
                  ) : (
                    <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'white' }}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text
                  sx={{
                    mt: '$1',
                    fontSize: 10,
                    fontWeight: '500',
                    textAlign: 'center',
                    maxWidth: 72,
                    color: textColor,
                  }}
                >
                  {STEP_LABELS[step]}
                </Text>
              </View>
              {i < PIPELINE_STEP_ORDER.length - 1 && (
                <View
                  sx={{
                    mx: '$1',
                    height: 2,
                    flex: 1,
                    bg: isCompleted ? 'green500' : 'gray200',
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
