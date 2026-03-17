import { View, Text } from 'dripsy';
import { Link } from 'solito/link';
import { useGetSequencingOrdersQuery, useGetGenomicResultsQuery } from '../generated/graphql';

export function SequencingHubScreen() {
  const { data: ordersData } = useGetSequencingOrdersQuery({ errorPolicy: 'ignore' });
  const { data: genomicData } = useGetGenomicResultsQuery({ errorPolicy: 'ignore' });

  const orders = ordersData?.sequencingOrders ?? [];
  const hasResultsReady = orders.some((o) => o.status === 'results_ready');
  const hasGenomicResults = (genomicData?.genomicResults?.length ?? 0) > 0;

  return (
    <View sx={{ mx: 'auto', maxWidth: 768, px: '$6', py: '$16', alignSelf: 'center', width: '100%' }}>
      {/* Hero */}
      <View sx={{ borderRadius: '$xl', bg: 'indigo100', borderWidth: 1, borderColor: 'indigo200', p: '$6', mb: '$8' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>Genomic Sequencing</Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Genomic sequencing analyzes your tumor&apos;s DNA to find mutations that can guide targeted treatment.
          This can help your oncologist choose the most effective therapy for your specific cancer.
        </Text>
      </View>

      {/* Pathway cards */}
      <View sx={{ flexDirection: ['column', 'row'], gap: '$4' }}>
        {/* Already have results */}
        <Link href={hasGenomicResults ? '/sequencing/results' : '/sequencing/upload'}>
          <View
            sx={{
              flex: 1,
              borderRadius: '$xl',
              borderWidth: 1,
              borderColor: hasResultsReady ? 'green300' : 'gray200',
              bg: hasResultsReady ? 'green50' : '$background',
              p: '$5',
            }}
          >
            <View sx={{ height: 40, width: 40, borderRadius: '$lg', bg: 'green100', alignItems: 'center', justifyContent: 'center' }}>
              <Text sx={{ fontSize: '$xl' }}>{'\uD83D\uDCC4'}</Text>
            </View>
            <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>
              {hasGenomicResults ? 'View your results' : 'I have results'}
            </Text>
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>
              {hasGenomicResults
                ? 'View your genomic results and personalized interpretation'
                : hasResultsReady
                  ? 'Your test results are ready \u2014 upload them now'
                  : 'Upload your existing genomic test results for analysis'}
            </Text>
            <Text sx={{ mt: '$2', fontSize: '$xs', color: 'blue600' }}>
              {hasGenomicResults ? 'View results' : 'Upload results'} {'\u2192'}
            </Text>
          </View>
        </Link>

        {/* Want sequencing */}
        <Link href="/sequencing/providers">
          <View sx={{ flex: 1, borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
            <View sx={{ height: 40, width: 40, borderRadius: '$lg', bg: 'indigo100', alignItems: 'center', justifyContent: 'center' }}>
              <Text sx={{ fontSize: '$xl' }}>{'\uD83E\uDDEA'}</Text>
            </View>
            <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>I want sequencing</Text>
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>Browse testing providers and check insurance coverage</Text>
            <Text sx={{ mt: '$2', fontSize: '$xs', color: 'blue600' }}>Find providers {'\u2192'}</Text>
          </View>
        </Link>

        {/* Not sure */}
        <Link href="/sequencing/guide">
          <View sx={{ flex: 1, borderRadius: '$xl', borderWidth: 1, borderColor: 'gray200', p: '$5' }}>
            <View sx={{ height: 40, width: 40, borderRadius: '$lg', bg: 'amber100', alignItems: 'center', justifyContent: 'center' }}>
              <Text sx={{ fontSize: '$xl' }}>{'\u2753'}</Text>
            </View>
            <Text sx={{ mt: '$3', fontWeight: '600', color: 'gray900' }}>I&apos;m not sure</Text>
            <Text sx={{ mt: '$1', fontSize: '$sm', color: 'gray500' }}>Take a guided assessment to find the right test for you</Text>
            <Text sx={{ mt: '$2', fontSize: '$xs', color: 'blue600' }}>Start guide {'\u2192'}</Text>
          </View>
        </Link>
      </View>

      {/* Quick stats */}
      <View sx={{ mt: '$10', flexDirection: 'row', borderWidth: 1, borderColor: 'gray200', borderRadius: '$lg', p: '$6' }}>
        <View sx={{ flex: 1, alignItems: 'center' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'indigo600' }}>10+</Text>
          <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Testing providers</Text>
        </View>
        <View sx={{ flex: 1, alignItems: 'center' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'indigo600' }}>300-648</Text>
          <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Genes analyzed</Text>
        </View>
        <View sx={{ flex: 1, alignItems: 'center' }}>
          <Text sx={{ fontSize: '$2xl', fontWeight: '700', color: 'indigo600' }}>7-21</Text>
          <Text sx={{ fontSize: '$xs', color: 'gray500' }}>Day turnaround</Text>
        </View>
      </View>
    </View>
  );
}
