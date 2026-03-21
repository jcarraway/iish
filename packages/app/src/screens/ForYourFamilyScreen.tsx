import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator, Share, Platform } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetPreventiveTrialsForFamilyQuery,
  useGenerateFamilyReferralLinkMutation,
  useGetReferralStatsQuery,
} from '../generated/graphql';

const STRENGTH_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  strong: { bg: '#DCFCE7', fg: '#166534', border: '#BBF7D0' },
  possible: { bg: '#DBEAFE', fg: '#1E40AF', border: '#93C5FD' },
  worth_discussing: { bg: '#FEF3C7', fg: '#92400E', border: '#FDE68A' },
};

export function ForYourFamilyScreen() {
  const { data: familyData, loading: familyLoading } = useGetPreventiveTrialsForFamilyQuery({ errorPolicy: 'ignore' });
  const { data: statsData } = useGetReferralStatsQuery({ errorPolicy: 'ignore' });
  const [generateLink, { data: linkData, loading: generating }] = useGenerateFamilyReferralLinkMutation();

  const [copied, setCopied] = useState(false);

  const familyTrials = familyData?.preventiveTrialsForFamily ?? [];
  const stats = statsData?.referralStats;
  const referral = linkData?.generateFamilyReferralLink;

  async function handleGenerateLink() {
    await generateLink();
  }

  async function handleCopyLink() {
    if (!referral) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referral.url);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may not be available
    }
  }

  async function handleShareText() {
    if (!referral) return;
    try {
      await Share.share({ message: referral.textMessage });
    } catch {
      // Share cancelled
    }
  }

  if (familyLoading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>For Your Family</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading family recommendations...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>For Your Family</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground', lineHeight: 22 }}>
          Your diagnosis may affect your family members' risk. Share preventive trial information with them.
        </Text>

        {/* Family risk overview */}
        <View sx={{
          mt: '$6', p: '$5', borderRadius: 12,
          backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: '#FDE68A',
        }}>
          <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
            <Text sx={{ fontSize: 16 }}>{'👨‍👩‍👧'}</Text>
            <Text sx={{ fontSize: 15, fontWeight: '600', color: '#92400E' }}>
              Why this matters for your family
            </Text>
          </View>
          <Text sx={{ mt: '$2', fontSize: 13, color: '#92400E', lineHeight: 20 }}>
            First-degree relatives of breast cancer patients have roughly double the average risk.
            BRCA mutation carriers face even higher lifetime risk. Prevention trials offer a way
            to proactively address this risk.
          </Text>
        </View>

        {/* Preventive trials for family */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
            Prevention trials for your family
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
            Based on your diagnosis and cancer profile
          </Text>

          {familyTrials.length === 0 ? (
            <View sx={{
              mt: '$4', p: '$5', borderRadius: 12,
              borderWidth: 1, borderColor: '$border',
            }}>
              <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>
                No prevention trials currently match your family profile. New trials open regularly —
                we'll notify you when relevant ones become available.
              </Text>
            </View>
          ) : (
            <View sx={{ mt: '$4', gap: '$3' }}>
              {familyTrials.map((match: any) => {
                const colors = STRENGTH_COLORS[match.matchStrength] ?? STRENGTH_COLORS.possible;
                return (
                  <View key={match.trial.nctId} sx={{
                    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
                    backgroundColor: colors.bg, p: '$5',
                  }}>
                    <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
                      <View sx={{
                        px: '$2', py: '$1', borderRadius: 6,
                        backgroundColor: colors.border,
                      }}>
                        <Text sx={{ fontSize: 11, fontWeight: '600', color: colors.fg }}>
                          {match.matchStrength.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                      {match.trial.phase && (
                        <Text sx={{ fontSize: 11, color: '$mutedForeground' }}>{match.trial.phase}</Text>
                      )}
                    </View>
                    <Text sx={{ mt: '$2', fontSize: 15, fontWeight: '600', color: '$foreground' }}>
                      {match.trial.title}
                    </Text>
                    {match.trial.vaccineTarget && (
                      <Text sx={{ mt: '$1', fontSize: 12, color: colors.fg }}>
                        Target: {match.trial.vaccineTarget}
                      </Text>
                    )}
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$foreground', lineHeight: 20 }}>
                      {match.matchReason}
                    </Text>
                    <Text sx={{ mt: '$2', fontSize: 13, color: '$mutedForeground', fontStyle: 'italic' }}>
                      {match.nextSteps}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Referral link section */}
        <View sx={{ mt: '$8' }}>
          <Text sx={{ fontSize: 18, fontWeight: '600', color: '$foreground' }}>
            Share with family members
          </Text>
          <Text sx={{ mt: '$1', fontSize: 13, color: '$mutedForeground' }}>
            Generate a personal link to share with family. They can take the eligibility quiz without creating an account.
          </Text>

          {!referral ? (
            <Pressable onPress={handleGenerateLink} disabled={generating}>
              <View sx={{
                mt: '$4', backgroundColor: 'blue600', borderRadius: 8,
                px: '$6', py: '$3', alignSelf: 'flex-start',
                flexDirection: 'row', alignItems: 'center', gap: '$2',
              }}>
                {generating && <ActivityIndicator size="small" color="white" />}
                <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                  {generating ? 'Generating...' : 'Generate shareable link'}
                </Text>
              </View>
            </Pressable>
          ) : (
            <View sx={{ mt: '$4', gap: '$3' }}>
              {/* Link display */}
              <View sx={{
                p: '$4', borderRadius: 8,
                backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '$border',
              }}>
                <Text sx={{ fontSize: 13, fontFamily: 'monospace', color: '$foreground' }}>
                  {referral.url}
                </Text>
              </View>

              {/* Action buttons */}
              <View sx={{ flexDirection: 'row', gap: '$3', flexWrap: 'wrap' }}>
                <Pressable onPress={handleCopyLink}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1, borderColor: 'blue600',
                    backgroundColor: copied ? '#DCFCE7' : 'white',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '500', color: copied ? '#166534' : 'blue600' }}>
                      {copied ? 'Copied!' : 'Copy link'}
                    </Text>
                  </View>
                </Pressable>
                <Pressable onPress={handleShareText}>
                  <View sx={{
                    px: '$4', py: '$2', borderRadius: 8,
                    borderWidth: 1, borderColor: 'blue600',
                  }}>
                    <Text sx={{ fontSize: 13, fontWeight: '500', color: 'blue600' }}>
                      Share via text
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Pre-written email */}
              <View sx={{
                mt: '$2', p: '$4', borderRadius: 12,
                borderWidth: 1, borderColor: '$border',
              }}>
                <Text sx={{ fontSize: 13, fontWeight: '500', color: '$foreground' }}>
                  Email template
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, fontWeight: '500', color: '$mutedForeground' }}>
                  Subject: {referral.emailSubject}
                </Text>
                <Text sx={{ mt: '$2', fontSize: 12, color: '$mutedForeground', lineHeight: 18 }}>
                  {referral.emailBody}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Referral stats */}
        {stats && (stats.totalSent > 0 || stats.totalRedeemed > 0) && (
          <View sx={{
            mt: '$6', p: '$4', borderRadius: 12,
            backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0',
          }}>
            <Text sx={{ fontSize: 14, fontWeight: '600', color: '#166534' }}>
              {stats.totalRedeemed} family member{stats.totalRedeemed !== 1 ? 's have' : ' has'} signed up via your link
            </Text>
            {stats.totalSent > stats.totalRedeemed && (
              <Text sx={{ mt: '$1', fontSize: 12, color: '#166534' }}>
                {stats.totalSent} link{stats.totalSent !== 1 ? 's' : ''} generated
              </Text>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View sx={{
          mt: '$8', p: '$4', borderRadius: 8,
          backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB',
        }}>
          <Text sx={{ fontSize: 11, color: '$mutedForeground', lineHeight: 18 }}>
            This information is for family members who do not have cancer. It is not medical advice.
            Family members should discuss their individual risk with their own healthcare provider.
            Trial eligibility is determined by trial investigators, not this tool.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
