import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter } from 'solito/router';
import { Link } from 'solito/link';
import { HealthSystemSearch } from '../components';
import { useAuthorizeFhirMutation, useExtractFhirMutation } from '../generated/graphql';
import type { HealthSystemResult, FhirResourceSummary } from '@oncovax/shared';

type Step = 'search' | 'confirm_connect' | 'connecting' | 'extracting' | 'done' | 'error';

export function MyChartScreen({ connected, connectionId: connIdParam, error: errorParam }: {
  connected?: string;
  connectionId?: string;
  error?: string;
}) {
  const router = useRouter();
  const [authorizeFhir] = useAuthorizeFhirMutation();
  const [extractFhir] = useExtractFhirMutation();

  const [step, setStep] = useState<Step>('search');
  const [selectedSystem, setSelectedSystem] = useState<HealthSystemResult | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [resourceSummary, setResourceSummary] = useState<FhirResourceSummary[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle callback redirect from OAuth
  useEffect(() => {
    if (errorParam) {
      setErrorMessage(
        errorParam === 'denied' ? 'You declined to connect your MyChart account.'
        : errorParam === 'invalid_state' ? 'The connection timed out. Please try again.'
        : errorParam === 'token_exchange_failed' ? 'Failed to connect to MyChart. Please try again.'
        : 'An error occurred. Please try again.'
      );
      setStep('error');
      return;
    }
    if (connected === 'true' && connIdParam) {
      setConnectionId(connIdParam);
      setStep('extracting');
      extractRecords(connIdParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSystemSelect = (system: HealthSystemResult) => {
    setSelectedSystem(system);
    setStep('confirm_connect');
  };

  const handleConnect = async () => {
    if (!selectedSystem) return;
    setStep('connecting');
    try {
      const { data } = await authorizeFhir({ variables: { healthSystemId: selectedSystem.id } });
      const url = data?.authorizeFhir?.authorizeUrl;
      if (!url) throw new Error('No authorize URL');
      if (Platform.OS === 'web') {
        window.location.href = url;
      } else {
        Linking.openURL(url);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to connect');
      setStep('error');
    }
  };

  const extractRecords = async (connId: string) => {
    try {
      const { data } = await extractFhir({ variables: { connectionId: connId } });
      const result = data?.extractFhir as any;
      setCompleteness(result?.completeness ?? 0);
      setMissingFields(result?.missingFields ?? []);
      setResourceSummary(result?.resourceSummary ?? []);
      if (result?.missingFields?.length > 0 && Platform.OS === 'web') {
        sessionStorage.setItem('oncovax_fhir_missing', JSON.stringify(result.missingFields));
      }
      setStep('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to extract records');
      setStep('error');
    }
  };

  // --- Step: Search ---
  if (step === 'search') {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connect MyChart</Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            Search for your hospital or health system to securely connect your medical records.
          </Text>
          <View sx={{ mt: '$8' }}>
            <HealthSystemSearch onSelect={handleSystemSelect} />
          </View>
          <View sx={{ mt: '$6', alignItems: 'center' }}>
            <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
              Don't see your health system?{' '}
            </Text>
            <Link href="/start/upload">
              <Text sx={{ fontSize: 14, color: 'blue600' }}>Upload your documents instead</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Step: Confirm connect ---
  if (step === 'confirm_connect' && selectedSystem) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connect to {selectedSystem.name}</Text>
          <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
            You'll be redirected to MyChart to authorize OncoVax to read your records.
          </Text>

          <View sx={{ mt: '$8', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$6' }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>What we'll access:</Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {['Cancer diagnosis and staging', 'Biomarker test results (ER, PR, HER2, etc.)', 'Recent lab values', 'Treatment medications and procedures'].map((item, i) => (
                <View key={i} sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$2' }}>
                  <Text sx={{ color: '#22C55E', fontSize: 14 }}>{'\u2713'}</Text>
                  <Text sx={{ fontSize: 14, color: '$mutedForeground', flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>

            <Text sx={{ mt: '$6', fontSize: 14, fontWeight: '600', color: '$foreground' }}>What we never access:</Text>
            <View sx={{ mt: '$3', gap: '$2' }}>
              {['Mental health records', 'Substance use or reproductive health', 'Billing or insurance details'].map((item, i) => (
                <View key={i} sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$2' }}>
                  <Text sx={{ color: '#F87171', fontSize: 14 }}>{'\u2717'}</Text>
                  <Text sx={{ fontSize: 14, color: '$mutedForeground', flex: 1 }}>{item}</Text>
                </View>
              ))}
            </View>

            <Text sx={{ mt: '$6', fontSize: 12, color: '#9CA3AF' }}>
              We never modify your records. You can revoke access at any time from your dashboard.
            </Text>
          </View>

          <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3' }}>
            <Pressable onPress={() => { setSelectedSystem(null); setStep('search'); }}>
              <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: 10 }}>
                <Text sx={{ fontSize: 14, color: '#374151' }}>Back</Text>
              </View>
            </Pressable>
            <Pressable onPress={handleConnect} style={{ flex: 1 }}>
              <View sx={{ flex: 1, backgroundColor: 'blue600', borderRadius: 8, px: '$6', py: 10, alignItems: 'center' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Connect to MyChart</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Step: Connecting ---
  if (step === 'connecting') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connecting to MyChart</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Redirecting to MyChart login...</Text>
        </View>
      </View>
    );
  }

  // --- Step: Extracting ---
  if (step === 'extracting') {
    return (
      <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Pulling your records</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>Connected! Now importing your medical records...</Text>
        <View sx={{ mt: '$8', gap: '$3' }}>
          {['Fetching diagnosis information', 'Reading biomarker results', 'Checking treatment history', 'Reviewing lab values'].map((label, i) => (
            <View key={i} sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
              <ActivityIndicator size="small" />
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>{label}...</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Step: Done ---
  if (step === 'done') {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
            <View sx={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
              <Text sx={{ fontSize: 24, color: '#16A34A' }}>{'\u2713'}</Text>
            </View>
            <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Records imported</Text>
          </View>

          <View sx={{ mt: '$6', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5' }}>
            <View sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text sx={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Profile completeness</Text>
              <Text sx={{ fontSize: 14, fontWeight: 'bold', color: '$foreground' }}>{Math.round(completeness * 100)}%</Text>
            </View>
            <View sx={{ mt: '$2', height: 8, borderRadius: 4, backgroundColor: '#F3F4F6' }}>
              <View sx={{ height: 8, borderRadius: 4, backgroundColor: '#22C55E', width: `${Math.round(completeness * 100)}%` as any }} />
            </View>
          </View>

          {resourceSummary.length > 0 && (
            <View sx={{ mt: '$4', borderRadius: 12, borderWidth: 1, borderColor: '$border', p: '$5' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '$foreground' }}>What we found:</Text>
              <View sx={{ mt: '$3', gap: '$2' }}>
                {resourceSummary.map((r, i) => (
                  <View key={i} sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: '$2' }}>
                    <Text sx={{ color: '#22C55E', fontSize: 14 }}>{'\u2713'}</Text>
                    <Text sx={{ fontSize: 14, color: '$mutedForeground', flex: 1 }}>
                      {r.description} ({r.count} record{r.count !== 1 ? 's' : ''})
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {missingFields.length > 0 && (
            <View sx={{ mt: '$4', borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A', backgroundColor: '#FFFBEB', p: '$5' }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: '#92400E' }}>
                We couldn't find {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} in your records:
              </Text>
              <Text sx={{ mt: '$1', fontSize: 12, color: '#B45309' }}>
                {missingFields.join(', ')}
              </Text>
              <Text sx={{ mt: '$2', fontSize: 12, color: '#D97706' }}>
                You'll be able to fill these in on the next screen.
              </Text>
            </View>
          )}

          <View sx={{ mt: '$8' }}>
            <Pressable onPress={() => router.push('/start/confirm?path=mychart')}>
              <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$6', py: '$3', alignItems: 'center' }}>
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Continue to confirm your details</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // --- Step: Error ---
  return (
    <View sx={{ mx: 'auto', maxWidth: 672, px: '$6', py: '$16', width: '100%' }}>
      <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Connection failed</Text>
      <Text sx={{ mt: '$2', fontSize: 14, color: 'red600' }}>{errorMessage}</Text>
      <View sx={{ mt: '$6', flexDirection: 'row', gap: '$3' }}>
        <Pressable onPress={() => { setErrorMessage(''); setStep('search'); }}>
          <View sx={{ borderRadius: 8, borderWidth: 1, borderColor: '$border', px: '$4', py: '$2' }}>
            <Text sx={{ fontSize: 14, color: '$foreground' }}>Try again</Text>
          </View>
        </Pressable>
        <Link href="/start/upload">
          <View sx={{ backgroundColor: 'blue600', borderRadius: 8, px: '$4', py: '$2' }}>
            <Text sx={{ fontSize: 14, color: 'white' }}>Upload documents instead</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}
