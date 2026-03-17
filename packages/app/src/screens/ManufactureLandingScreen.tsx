import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetMatchesQuery,
  useGetPipelineJobsQuery,
  useGetManufacturingOrdersQuery,
} from '../generated/graphql';

export function ManufactureLandingScreen() {
  const { data: matchData, loading: l1 } = useGetMatchesQuery();
  const { data: pipelineData, loading: l2 } = useGetPipelineJobsQuery();
  const { data: orderData, loading: l3 } = useGetManufacturingOrdersQuery();
  const loading = l1 || l2 || l3;

  const hasTrialMatches = (matchData?.matches?.length ?? 0) > 0;
  const hasPipelineJob = (pipelineData?.pipelineJobs?.length ?? 0) > 0;
  const orders = orderData?.manufacturingOrders ?? [];
  const orderCount = orders.length;
  const hasAdministered = orders.some((o) => o.administeredAt);

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          From Blueprint to Vaccine
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Connect your personalized vaccine blueprint with manufacturing partners and navigate the
          regulatory pathway to treatment.
        </Text>

        {/* Clinical Trial First Recommendation */}
        {!loading && hasTrialMatches && (
          <View sx={{ mt: '$6', borderRadius: '$xl', borderWidth: 2, borderColor: 'green200', bg: 'green50', p: '$5' }}>
            <View sx={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
              <View sx={{ width: 32, height: 32, borderRadius: 16, bg: 'green100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ color: 'green600', fontWeight: '700' }}>&#10003;</Text>
              </View>
              <View sx={{ flex: 1 }}>
                <Text sx={{ fontWeight: '600', color: 'green900' }}>Clinical Trials Available</Text>
                <Text sx={{ mt: '$1', fontSize: '$sm', color: 'green800' }}>
                  You have active clinical trial matches. Clinical trials are typically the best
                  first option — they provide treatment at no cost, with the highest safety
                  monitoring, and contribute to advancing cancer research.
                </Text>
                <Link href="/matches">
                  <View sx={{ mt: '$3', bg: 'green600', borderRadius: '$lg', px: '$4', py: '$2', alignSelf: 'flex-start' }}>
                    <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>
                      View your trial matches
                    </Text>
                  </View>
                </Link>
              </View>
            </View>
          </View>
        )}

        {/* Main pathways */}
        <View sx={{ mt: '$8', gap: 24 }}>
          {/* Manufacturing Partners */}
          <Link href="/manufacture/partners">
            <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
              <View sx={{ width: 40, height: 40, borderRadius: '$lg', bg: 'blue100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ fontSize: '$lg' }}>&#x1F3ED;</Text>
              </View>
              <Text sx={{ mt: '$4', fontSize: '$lg', fontWeight: '600', color: 'gray900' }}>
                Manufacturing Partners
              </Text>
              <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
                Browse our directory of contract manufacturing organizations (CDMOs) capable of
                producing personalized mRNA cancer vaccines.
              </Text>
              <Text sx={{ mt: '$4', fontSize: '$sm', fontWeight: '500', color: 'blue600' }}>
                Browse partners &rarr;
              </Text>
            </View>
          </Link>

          {/* Regulatory Pathway */}
          <Link href="/manufacture/regulatory">
            <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$6' }}>
              <View sx={{ width: 40, height: 40, borderRadius: '$lg', bg: 'purple100', alignItems: 'center', justifyContent: 'center' }}>
                <Text sx={{ fontSize: '$lg' }}>&#x1F4C4;</Text>
              </View>
              <Text sx={{ mt: '$4', fontSize: '$lg', fontWeight: '600', color: 'gray900' }}>
                Regulatory Pathway
              </Text>
              <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
                Understand your options for legally accessing your personalized vaccine — from
                expanded access to Right to Try.
              </Text>
              <Text sx={{ mt: '$4', fontSize: '$sm', fontWeight: '500', color: 'purple600' }}>
                Explore pathways &rarr;
              </Text>
            </View>
          </Link>
        </View>

        {/* Pipeline status */}
        {!loading && !hasPipelineJob && (
          <View sx={{ mt: '$8', borderRadius: '$lg', borderWidth: 1, borderColor: 'amber200', bg: 'amber50', p: '$4' }}>
            <Text sx={{ fontSize: '$sm', color: 'amber800' }}>
              <Text sx={{ fontWeight: '700' }}>No vaccine blueprint yet.</Text> Manufacturing and
              regulatory pathways require a completed vaccine blueprint from the neoantigen pipeline.
              You can still browse manufacturing partners and learn about regulatory pathways.
            </Text>
            <Link href="/pipeline">
              <Text sx={{ mt: '$2', fontSize: '$sm', fontWeight: '500', color: 'amber700' }}>
                Start neoantigen pipeline &rarr;
              </Text>
            </Link>
          </View>
        )}

        {/* M2 Section — Orders, Providers, Monitoring */}
        {!loading && (hasPipelineJob || orderCount > 0) && (
          <View sx={{ mt: '$8' }}>
            <Text sx={{ fontSize: '$lg', fontWeight: '600', color: 'gray900' }}>
              Your Vaccine Journey
            </Text>
            <View sx={{ mt: '$4', gap: 16 }}>
              <Link href="/manufacture/orders">
                <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
                  <View sx={{ width: 40, height: 40, borderRadius: '$lg', bg: 'orange100', alignItems: 'center', justifyContent: 'center' }}>
                    <Text sx={{ fontSize: '$lg' }}>&#x1F4CB;</Text>
                  </View>
                  <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>Your Orders</Text>
                  {orderCount > 0 ? (
                    <Text sx={{ mt: '$1', fontSize: '$2xl', fontWeight: '700', color: 'gray900' }}>{orderCount}</Text>
                  ) : (
                    <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>Start a manufacturing order</Text>
                  )}
                </View>
              </Link>
              <Link href="/manufacture/providers">
                <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
                  <View sx={{ width: 40, height: 40, borderRadius: '$lg', bg: 'teal100', alignItems: 'center', justifyContent: 'center' }}>
                    <Text sx={{ fontSize: '$lg' }}>&#x1F4CD;</Text>
                  </View>
                  <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>Administration Sites</Text>
                  <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>Find a facility near you</Text>
                </View>
              </Link>
              <Link href="/manufacture/monitoring">
                <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
                  <View sx={{ width: 40, height: 40, borderRadius: '$lg', bg: 'rose100', alignItems: 'center', justifyContent: 'center' }}>
                    <Text sx={{ fontSize: '$lg' }}>&#x2764;</Text>
                  </View>
                  <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>Post-Admin Monitoring</Text>
                  <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>
                    {hasAdministered ? 'Track your recovery' : 'Available after administration'}
                  </Text>
                </View>
              </Link>
            </View>
          </View>
        )}

        {/* Cost transparency */}
        <View sx={{ mt: '$8', borderWidth: 1, borderColor: 'gray200', borderRadius: '$lg', p: '$5' }}>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>Cost Expectations</Text>
          <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray600' }}>
            Personalized mRNA vaccine manufacturing typically costs between{' '}
            <Text sx={{ fontWeight: '700' }}>$50,000 — $300,000+</Text> depending on the manufacturer,
            regulatory pathway, and specific requirements. Clinical trials may cover these costs entirely.
          </Text>
          <View sx={{ mt: '$3', gap: 12 }}>
            {[
              { label: 'Clinical Trial', cost: '$0 — $25K', color: 'green700' },
              { label: 'Expanded Access', cost: '$50K — $200K', color: 'blue700' },
              { label: 'Physician IND', cost: '$100K — $400K', color: 'amber700' },
            ].map((tier) => (
              <View key={tier.label} sx={{ bg: 'gray50', borderRadius: '$lg', p: '$3', alignItems: 'center' }}>
                <Text sx={{ fontSize: 11, color: 'gray500' }}>{tier.label}</Text>
                <Text sx={{ fontSize: '$sm', fontWeight: '600', color: tier.color as any }}>{tier.cost}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
