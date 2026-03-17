import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import { useRouter } from 'solito/router';
import {
  useGetMatchesQuery,
  useGetFinancialMatchesQuery,
  useGetFhirConnectionsQuery,
  useGetSequencingOrdersQuery,
  useGetPipelineJobsQuery,
  useGetManufacturingOrdersQuery,
} from '../generated/graphql';

interface CardProps {
  href: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

function DashboardCard({ href, icon, iconBg, iconColor, title, children }: CardProps) {
  return (
    <Link href={href}>
      <View sx={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '$border',
        p: '$5',
      }}>
        <View sx={{ flexDirection: 'row', alignItems: 'center', gap: '$2' }}>
          <View sx={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: iconBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text sx={{ fontSize: 14 }}>{icon}</Text>
          </View>
          <Text sx={{ fontWeight: '600', color: '$foreground' }}>{title}</Text>
        </View>
        {children}
      </View>
    </Link>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const { data: matchesData, loading: ml } = useGetMatchesQuery({ errorPolicy: 'ignore' });
  const { data: financialData, loading: fl } = useGetFinancialMatchesQuery({ errorPolicy: 'ignore' });
  const { data: fhirData, loading: fhl } = useGetFhirConnectionsQuery({ errorPolicy: 'ignore' });
  const { data: seqData, loading: sl } = useGetSequencingOrdersQuery({ errorPolicy: 'ignore' });
  const { data: pipeData, loading: pl } = useGetPipelineJobsQuery({ errorPolicy: 'ignore' });
  const { data: mfgData, loading: mfl } = useGetManufacturingOrdersQuery({ errorPolicy: 'ignore' });

  const loading = ml || fl || fhl || sl || pl || mfl;

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Dashboard</Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: '$3' }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: 14, color: '$mutedForeground' }}>Loading your dashboard...</Text>
        </View>
      </View>
    );
  }

  const matches = matchesData?.matches ?? [];
  const hasProfile = matchesData !== undefined;
  const financialEligibleCount = financialData?.financialMatches?.length ?? 0;
  const financialTotalEstimated = financialData?.financialMatches?.reduce(
    (sum: number, m: any) => sum + (m.maxBenefitAmount ?? 0), 0
  ) ?? 0;
  const activeConnections = (fhirData?.fhirConnections ?? []).filter(
    (c: any) => c.syncStatus !== 'revoked'
  );
  const orders = seqData?.sequencingOrders ?? [];
  const pipelineJobCount = pipeData?.pipelineJobs?.length ?? 0;
  const mfgOrderCount = mfgData?.manufacturingOrders?.length ?? 0;

  if (!hasProfile) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Dashboard</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>
          Get started by creating your patient profile.
        </Text>
        <View sx={{ mt: '$8' }}>
          <Pressable onPress={() => router.push('/start')}>
            <View sx={{
              backgroundColor: 'blue600',
              borderRadius: 8,
              px: '$6',
              py: '$3',
              alignSelf: 'flex-start',
            }}>
              <Text sx={{ fontSize: 14, fontWeight: '600', color: 'white' }}>Get started</Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: 30, fontWeight: 'bold', color: '$foreground' }}>Dashboard</Text>
        <Text sx={{ mt: '$2', fontSize: 14, color: '$mutedForeground' }}>Your cancer navigation hub</Text>

        <View sx={{ mt: '$8', gap: '$4' }}>
          {/* Trial Matches */}
          <DashboardCard href="/matches" icon="\u{1F52C}" iconBg="#DBEAFE" iconColor="blue600" title="Trial Matches">
            <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
              {matches.length}
            </Text>
            <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
              {matches.length > 0 && matches[0]?.matchScore
                ? `Top score: ${Math.round(matches[0].matchScore * 100)}%`
                : 'No matches yet'}
            </Text>
          </DashboardCard>

          {/* Treatment Guide */}
          <DashboardCard href="/translate" icon="\u{1F4D6}" iconBg="#F3E8FF" iconColor="purple600" title="Treatment Guide">
            <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
              Understand your diagnosis and treatment plan in plain language
            </Text>
            <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>View guide →</Text>
          </DashboardCard>

          {/* Financial Help */}
          <DashboardCard href="/financial" icon="\u{1F4B0}" iconBg="#DCFCE7" iconColor="green600" title="Financial Help">
            {financialEligibleCount > 0 ? (
              <>
                <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
                  {financialEligibleCount}
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  eligible program{financialEligibleCount !== 1 ? 's' : ''}
                  {financialTotalEstimated > 0 ? ` · up to $${financialTotalEstimated.toLocaleString()}` : ''}
                </Text>
              </>
            ) : (
              <>
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  Find financial assistance programs you qualify for
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>Find assistance →</Text>
              </>
            )}
          </DashboardCard>

          {/* Sequencing */}
          <DashboardCard
            href={orders.length > 0 ? '/sequencing/orders' : '/sequencing'}
            icon="\u{1F9EC}" iconBg="#E0E7FF" iconColor="indigo600" title="Sequencing"
          >
            {orders.length > 0 ? (
              <>
                <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
                  {orders.length}
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  order{orders.length !== 1 ? 's' : ''}
                  {orders[0]?.status ? ` · ${orders[0].status.replace(/_/g, ' ')}` : ''}
                </Text>
              </>
            ) : (
              <>
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  Find genomic testing providers and check coverage
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>Explore options →</Text>
              </>
            )}
          </DashboardCard>

          {/* Connected Records */}
          <DashboardCard
            href={activeConnections.length > 0 ? '/dashboard/records' : '/start/mychart'}
            icon="\u{1F517}" iconBg="#CFFAFE" iconColor="cyan600" title="Records"
          >
            {activeConnections.length > 0 ? (
              <>
                <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
                  {activeConnections.length}
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  connected system{activeConnections.length !== 1 ? 's' : ''}
                </Text>
              </>
            ) : (
              <>
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  Connect MyChart to import records automatically
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>Connect →</Text>
              </>
            )}
          </DashboardCard>

          {/* Manufacturing */}
          <DashboardCard
            href={mfgOrderCount > 0 ? '/manufacture/orders' : '/manufacture'}
            icon="\u{1F3ED}" iconBg="#FFEDD5" iconColor="orange600" title="Manufacturing"
          >
            {mfgOrderCount > 0 ? (
              <>
                <Text sx={{ mt: '$3', fontSize: 24, fontWeight: 'bold', color: '$foreground' }}>
                  {mfgOrderCount}
                </Text>
                <Text sx={{ fontSize: 12, color: '$mutedForeground' }}>
                  active order{mfgOrderCount !== 1 ? 's' : ''}
                </Text>
              </>
            ) : pipelineJobCount > 0 ? (
              <>
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  Blueprint ready — explore manufacturing partners and regulatory pathways
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>Get started →</Text>
              </>
            ) : (
              <>
                <Text sx={{ mt: '$3', fontSize: 14, color: '$mutedForeground' }}>
                  From vaccine blueprint to production — find CDMOs and navigate regulatory pathways
                </Text>
                <Text sx={{ mt: '$1', fontSize: 12, color: 'blue600' }}>Explore →</Text>
              </>
            )}
          </DashboardCard>
        </View>
      </View>
    </ScrollView>
  );
}
