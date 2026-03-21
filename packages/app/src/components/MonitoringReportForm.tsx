import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'dripsy';
import type { MonitoringReportType, AdverseEventSeverity, TumorResponse } from '@iish/shared';
import { ADVERSE_EVENT_OPTIONS } from '@iish/shared';
import { Picker } from './Picker';

interface MonitoringReportFormProps {
  orderId: string;
  reportType: MonitoringReportType;
  onSubmit: (data: ReportFormData) => void;
  submitting?: boolean;
}

export interface ReportFormData {
  reportType: MonitoringReportType;
  hasAdverseEvents: boolean;
  adverseEvents: {
    event: string;
    severity: AdverseEventSeverity;
    onset: string;
    duration: string | null;
    resolved: boolean;
    treatment: string | null;
  }[];
  temperature: number | null;
  bloodPressure: string | null;
  heartRate: number | null;
  narrative: string;
  qualityOfLifeScore: number | null;
  tumorResponse: TumorResponse | null;
  imagingResults: string | null;
}

const SEVERITY_OPTIONS: { value: AdverseEventSeverity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'life_threatening', label: 'Life threatening' },
];

const REPORT_TYPE_LABELS: Record<MonitoringReportType, string> = {
  immediate: 'Immediate (30 min)',
  '24hr': '24 Hours',
  '48hr': '48 Hours',
  '7day': '1 Week',
  '14day': '2 Weeks',
  '28day': '4 Weeks',
  '3month': '3 Months',
  '6month': '6 Months',
};

const LATER_TYPES: MonitoringReportType[] = ['28day', '3month', '6month'];

const TUMOR_RESPONSE_OPTIONS = [
  { value: '', label: 'Not evaluated / No imaging' },
  { value: 'complete_response', label: 'Complete Response' },
  { value: 'partial_response', label: 'Partial Response' },
  { value: 'stable_disease', label: 'Stable Disease' },
  { value: 'progressive_disease', label: 'Progressive Disease' },
];

export function MonitoringReportForm({
  reportType,
  onSubmit,
  submitting,
}: MonitoringReportFormProps) {
  const [selectedAEs, setSelectedAEs] = useState<Set<string>>(new Set());
  const [aeSeverities, setAeSeverities] = useState<Record<string, AdverseEventSeverity>>({});
  const [temperature, setTemperature] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [narrative, setNarrative] = useState('');
  const [qolScore, setQolScore] = useState(5);
  const [tumorResponse, setTumorResponse] = useState('');
  const [imagingResults, setImagingResults] = useState('');

  const showTumorResponse = LATER_TYPES.includes(reportType);

  function toggleAE(event: string) {
    const next = new Set(selectedAEs);
    if (next.has(event)) {
      next.delete(event);
    } else {
      next.add(event);
      if (!aeSeverities[event]) {
        setAeSeverities((prev) => ({ ...prev, [event]: 'mild' }));
      }
    }
    setSelectedAEs(next);
  }

  function handleSubmit() {
    const adverseEvents = Array.from(selectedAEs).map((event) => ({
      event,
      severity: aeSeverities[event] ?? ('mild' as AdverseEventSeverity),
      onset: 'post-administration',
      duration: null,
      resolved: false,
      treatment: null,
    }));

    onSubmit({
      reportType,
      hasAdverseEvents: adverseEvents.length > 0,
      adverseEvents,
      temperature: temperature ? parseFloat(temperature) : null,
      bloodPressure: bloodPressure || null,
      heartRate: heartRate ? parseInt(heartRate, 10) : null,
      narrative,
      qualityOfLifeScore: qolScore,
      tumorResponse: (tumorResponse as TumorResponse) || null,
      imagingResults: imagingResults || null,
    });
  }

  const aeByCategory = {
    injection_site: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'injection_site'),
    systemic: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'systemic'),
    serious: ADVERSE_EVENT_OPTIONS.filter((ae) => ae.category === 'serious'),
  };

  return (
    <View sx={{ gap: '$6' }}>
      <View sx={{ borderRadius: '$lg', borderWidth: 1, borderColor: 'blue200', bg: 'blue50', p: '$4' }}>
        <Text sx={{ fontWeight: '600', color: 'blue900' }}>
          {REPORT_TYPE_LABELS[reportType]} Check-In
        </Text>
        <Text sx={{ mt: '$1', fontSize: '$sm', color: 'blue800' }}>
          Please report any symptoms or changes since your vaccine administration.
        </Text>
      </View>

      {/* Adverse Events */}
      <View>
        <Text sx={{ fontWeight: '500', color: 'gray900' }}>Symptoms & Side Effects</Text>
        <Text sx={{ mt: '$1', fontSize: '$xs', color: 'gray500' }}>Check all that apply</Text>

        {(['injection_site', 'systemic', 'serious'] as const).map((category) => (
          <View key={category} sx={{ mt: '$3' }}>
            <Text
              sx={{
                fontSize: '$xs',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: 'gray500',
              }}
            >
              {category === 'injection_site'
                ? 'Injection Site'
                : category === 'systemic'
                  ? 'Systemic'
                  : 'Serious (seek medical attention)'}
            </Text>
            <View sx={{ mt: 6, flexDirection: 'row', flexWrap: 'wrap', gap: '$2' }}>
              {aeByCategory[category].map((ae) => {
                const isActive = selectedAEs.has(ae.event);
                return (
                  <Pressable
                    key={ae.event}
                    onPress={() => toggleAE(ae.event)}
                    sx={{
                      borderRadius: '$full',
                      px: '$3',
                      py: '$1',
                      borderWidth: 1,
                      bg: isActive
                        ? category === 'serious'
                          ? 'red100'
                          : 'blue100'
                        : 'white',
                      borderColor: isActive
                        ? category === 'serious'
                          ? 'red300'
                          : 'blue300'
                        : 'gray200',
                    }}
                  >
                    <Text
                      sx={{
                        fontSize: '$xs',
                        fontWeight: '500',
                        color: isActive
                          ? category === 'serious'
                            ? 'red800'
                            : 'blue800'
                          : 'gray600',
                      }}
                    >
                      {ae.event}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Severity selectors */}
        {selectedAEs.size > 0 && (
          <View
            sx={{
              mt: '$4',
              borderRadius: '$lg',
              borderWidth: 1,
              borderColor: 'gray200',
              p: '$3',
              gap: '$2',
            }}
          >
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>
              Severity for selected symptoms:
            </Text>
            {Array.from(selectedAEs).map((event) => (
              <View
                key={event}
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text sx={{ fontSize: '$sm', color: 'gray700', flex: 1 }}>{event}</Text>
                <View sx={{ width: 140 }}>
                  <Picker
                    value={aeSeverities[event] ?? 'mild'}
                    onValueChange={(v) =>
                      setAeSeverities((prev) => ({
                        ...prev,
                        [event]: v as AdverseEventSeverity,
                      }))
                    }
                    options={SEVERITY_OPTIONS}
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Vitals */}
      <View>
        <Text sx={{ fontWeight: '500', color: 'gray900' }}>Vitals (optional)</Text>
        <View sx={{ mt: '$2', flexDirection: 'row', flexWrap: 'wrap', gap: '$3' }}>
          <View sx={{ width: ['100%', '30%'] }}>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Temperature ({'\u00B0'}F)</Text>
            <TextInput
              value={temperature}
              onChangeText={setTemperature}
              placeholder="98.6"
              keyboardType="decimal-pad"
              sx={{
                mt: '$1',
                width: '100%',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray200',
                px: '$3',
                py: '$2',
                fontSize: '$sm',
              }}
            />
          </View>
          <View sx={{ width: ['100%', '30%'] }}>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Blood Pressure</Text>
            <TextInput
              value={bloodPressure}
              onChangeText={setBloodPressure}
              placeholder="120/80"
              sx={{
                mt: '$1',
                width: '100%',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray200',
                px: '$3',
                py: '$2',
                fontSize: '$sm',
              }}
            />
          </View>
          <View sx={{ width: ['100%', '30%'] }}>
            <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Heart Rate (bpm)</Text>
            <TextInput
              value={heartRate}
              onChangeText={setHeartRate}
              placeholder="72"
              keyboardType="number-pad"
              sx={{
                mt: '$1',
                width: '100%',
                borderRadius: '$lg',
                borderWidth: 1,
                borderColor: 'gray200',
                px: '$3',
                py: '$2',
                fontSize: '$sm',
              }}
            />
          </View>
        </View>
      </View>

      {/* Quality of Life */}
      <View>
        <Text sx={{ fontWeight: '500', color: 'gray900' }}>How are you feeling overall?</Text>
        <View sx={{ mt: '$2' }}>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', gap: '$1' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Pressable
                key={n}
                onPress={() => setQolScore(n)}
                sx={{
                  flex: 1,
                  py: '$2',
                  borderRadius: '$sm',
                  bg: qolScore === n ? 'blue600' : 'gray100',
                  alignItems: 'center',
                }}
              >
                <Text
                  sx={{
                    fontSize: '$xs',
                    fontWeight: '500',
                    color: qolScore === n ? 'white' : 'gray600',
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            ))}
          </View>
          <View sx={{ flexDirection: 'row', justifyContent: 'space-between', mt: '$1' }}>
            <Text sx={{ fontSize: '$xs', color: 'gray400' }}>1 {'\u2014'} Very poor</Text>
            <Text sx={{ fontSize: '$xs', fontWeight: '500', color: 'gray700' }}>{qolScore}/10</Text>
            <Text sx={{ fontSize: '$xs', color: 'gray400' }}>10 {'\u2014'} Excellent</Text>
          </View>
        </View>
      </View>

      {/* Tumor response */}
      {showTumorResponse && (
        <View>
          <Text sx={{ fontWeight: '500', color: 'gray900' }}>
            Tumor Response (if imaging performed)
          </Text>
          <View sx={{ mt: '$2' }}>
            <Picker
              value={tumorResponse}
              onValueChange={setTumorResponse}
              options={TUMOR_RESPONSE_OPTIONS}
              placeholder="Not evaluated / No imaging"
            />
          </View>
          <TextInput
            value={imagingResults}
            onChangeText={setImagingResults}
            placeholder="Describe imaging findings (optional)"
            multiline
            numberOfLines={2}
            sx={{
              mt: '$2',
              width: '100%',
              borderRadius: '$lg',
              borderWidth: 1,
              borderColor: 'gray200',
              px: '$3',
              py: '$2',
              fontSize: '$sm',
              minHeight: 60,
            }}
          />
        </View>
      )}

      {/* Narrative */}
      <View>
        <Text sx={{ fontWeight: '500', color: 'gray900' }}>Anything else to share?</Text>
        <TextInput
          value={narrative}
          onChangeText={setNarrative}
          placeholder="How are you feeling? Any concerns? (60 seconds is all we need)"
          multiline
          numberOfLines={3}
          sx={{
            mt: '$2',
            width: '100%',
            borderRadius: '$lg',
            borderWidth: 1,
            borderColor: 'gray200',
            px: '$3',
            py: '$2',
            fontSize: '$sm',
            minHeight: 80,
          }}
        />
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        sx={{
          width: '100%',
          borderRadius: '$lg',
          bg: submitting ? 'gray300' : 'blue600',
          px: '$4',
          py: '$3',
          alignItems: 'center',
          opacity: submitting ? 0.5 : 1,
        }}
      >
        <Text sx={{ fontSize: '$sm', fontWeight: '600', color: 'white' }}>
          {submitting ? 'Submitting...' : 'Submit Report'}
        </Text>
      </Pressable>
    </View>
  );
}
