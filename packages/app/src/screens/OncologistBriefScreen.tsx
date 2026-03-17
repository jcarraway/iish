import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Platform } from 'react-native';
import { Link } from 'solito/link';
import { copyToClipboard } from '../utils';
import { useGetOncologistBriefQuery } from '../generated/graphql';

export function OncologistBriefScreen({ trialId }: { trialId: string }) {
  const { data, loading, error } = useGetOncologistBriefQuery({
    variables: { matchId: trialId },
  });
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data?.oncologistBrief?.content) return;
    const ok = await copyToClipboard(data.oncologistBrief.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      window.print();
    }
  };

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href={`/matches/${trialId}`}>
          <Text sx={{ fontSize: '$sm', color: 'gray500', mb: '$6' }}>&larr; Back to trial</Text>
        </Link>
        <View sx={{ alignItems: 'center', py: '$16' }}>
          <ActivityIndicator size="large" />
          <Text sx={{ color: 'gray500', mt: '$4' }}>Generating oncologist brief...</Text>
          <Text sx={{ fontSize: 11, color: 'gray400', mt: '$1' }}>This may take 10-15 seconds</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href={`/matches/${trialId}`}>
          <Text sx={{ fontSize: '$sm', color: 'gray500', mb: '$6' }}>&larr; Back to trial</Text>
        </Link>
        <View sx={{ bg: 'red50', borderWidth: 1, borderColor: 'red200', borderRadius: '$lg', p: '$4' }}>
          <Text sx={{ color: 'red700' }}>{error.message}</Text>
        </View>
      </View>
    );
  }

  const brief = data?.oncologistBrief?.content;

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Link href={`/matches/${trialId}`}>
          <Text sx={{ fontSize: '$sm', color: 'gray500', mb: '$6' }}>&larr; Back to trial</Text>
        </Link>

        <View sx={{ mb: '$6' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>
            Oncologist Brief
          </Text>
          <Text sx={{ color: 'gray500', mt: '$1' }}>
            Share this summary with your oncologist to discuss this trial.
          </Text>
        </View>

        {/* Action buttons */}
        <View sx={{ flexDirection: 'row', gap: 12, mb: '$6' }}>
          <Pressable onPress={handleCopy}>
            <View sx={{ bg: 'gray900', borderRadius: '$lg', px: '$4', py: '$2' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </Text>
            </View>
          </Pressable>
          {Platform.OS === 'web' && (
            <Pressable onPress={handlePrint}>
              <View sx={{ borderWidth: 1, borderColor: 'gray300', borderRadius: '$lg', px: '$4', py: '$2' }}>
                <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'gray700' }}>Print</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/* Brief content */}
        <View sx={{ bg: 'white', borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$8' }}>
          <Text sx={{ fontSize: '$sm', color: 'gray800', fontFamily: 'monospace' }}>
            {brief}
          </Text>
        </View>

        {/* Disclaimer */}
        <View sx={{ mt: '$6', p: '$4', bg: 'yellow50', borderWidth: 1, borderColor: 'yellow200', borderRadius: '$lg' }}>
          <Text sx={{ fontSize: 11, color: 'yellow800' }}>
            <Text sx={{ fontWeight: '700' }}>Disclaimer:</Text> This brief is AI-generated based on
            publicly available trial data and the patient&apos;s self-reported clinical profile. It is
            not a clinical recommendation and should not replace professional medical judgment. Always
            verify eligibility directly with the trial site.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
