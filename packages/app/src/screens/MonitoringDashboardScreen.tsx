import { View, Text, Pressable, ScrollView } from 'dripsy';
import { ActivityIndicator } from 'react-native';
import { Link } from 'solito/link';
import {
  useGetManufacturingOrdersQuery,
  useGetMonitoringScheduleQuery,
} from '../generated/graphql';

function ScheduleSection({ orderId, partnerName, administeredAt }: { orderId: string; partnerName: string; administeredAt: string }) {
  const { data } = useGetMonitoringScheduleQuery({ variables: { orderId } });
  const schedule = data?.monitoringSchedule ?? [];

  const overdue = schedule.filter((s) => s.status === 'overdue');
  const dueToday = schedule.filter((s) => s.status === 'due_today');
  const completed = schedule.filter((s) => s.status === 'completed');
  const upcoming = schedule.filter((s) => s.status === 'upcoming');
  const nextDue = overdue[0] ?? dueToday[0];

  return (
    <View sx={{ borderWidth: 1, borderColor: 'gray200', borderRadius: '$xl', p: '$5' }}>
      <View sx={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View>
          <Text sx={{ fontWeight: '600', color: 'gray900' }}>{partnerName}</Text>
          <Text sx={{ fontSize: 11, color: 'gray500' }}>
            Administered {new Date(administeredAt).toLocaleDateString()}
          </Text>
        </View>
        {overdue.length > 0 && (
          <View sx={{ bg: 'red100', borderRadius: 9999, px: 10, py: 2 }}>
            <Text sx={{ fontSize: 11, fontWeight: '500', color: 'red700' }}>
              {overdue.length} overdue
            </Text>
          </View>
        )}
      </View>

      {nextDue && (
        <View sx={{ mt: '$4', borderRadius: '$lg', p: '$3', bg: nextDue.status === 'overdue' ? 'red50' : 'blue50' }}>
          <Text sx={{ fontSize: '$sm', fontWeight: '500', color: nextDue.status === 'overdue' ? 'red800' : 'blue800' }}>
            {nextDue.status === 'overdue' ? 'Overdue: ' : 'Due today: '}
            {nextDue.description}
          </Text>
          <Link href={`/manufacture/monitoring/${orderId}/report?type=${nextDue.reportType}`}>
            <View sx={{ mt: '$2', bg: nextDue.status === 'overdue' ? 'red600' : 'blue600', borderRadius: '$lg', px: '$4', py: 6, alignSelf: 'flex-start' }}>
              <Text sx={{ fontSize: '$sm', fontWeight: '500', color: 'white' }}>Submit check-in</Text>
            </View>
          </Link>
        </View>
      )}

      <View sx={{ mt: '$4', flexDirection: 'row', gap: 16, alignItems: 'center' }}>
        <Text sx={{ fontSize: 11, color: 'gray500' }}>{completed.length} completed</Text>
        <Text sx={{ fontSize: 11, color: 'gray500' }}>{upcoming.length} upcoming</Text>
        <Link href={`/manufacture/monitoring/${orderId}/history`}>
          <Text sx={{ fontSize: 11, color: 'blue600' }}>View full history</Text>
        </Link>
      </View>
    </View>
  );
}

export function MonitoringDashboardScreen() {
  const { data, loading } = useGetManufacturingOrdersQuery();
  const administered = (data?.manufacturingOrders ?? []).filter((o) => o.administeredAt);

  if (loading) {
    return (
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Post-Administration Monitoring
        </Text>
        <View sx={{ mt: '$8', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="small" />
          <Text sx={{ fontSize: '$sm', color: 'gray600' }}>Loading monitoring schedule...</Text>
        </View>
      </View>
    );
  }

  if (administered.length === 0) {
    return (
      <ScrollView sx={{ flex: 1 }}>
        <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
          <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
            Post-Administration Monitoring
          </Text>
          <View sx={{ mt: '$8', borderWidth: 2, borderStyle: 'dashed', borderColor: 'gray200', borderRadius: '$xl', p: '$8', alignItems: 'center' }}>
            <Text sx={{ fontWeight: '500', color: 'gray900' }}>No administered vaccines yet</Text>
            <Text sx={{ mt: '$2', fontSize: '$sm', color: 'gray500', textAlign: 'center' }}>
              Once your vaccine has been administered, your monitoring schedule will appear here.
            </Text>
            <Link href="/manufacture/orders">
              <Text sx={{ mt: '$4', fontSize: '$sm', fontWeight: '500', color: 'blue600' }}>
                View your orders &rarr;
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView sx={{ flex: 1 }}>
      <View sx={{ mx: 'auto', maxWidth: 896, px: '$6', py: '$16', width: '100%' }}>
        <Text sx={{ fontSize: '$3xl', fontWeight: '700', color: 'gray900' }}>
          Post-Administration Monitoring
        </Text>
        <Text sx={{ mt: '$2', color: 'gray600' }}>
          Track your post-vaccine check-ins and report any symptoms
        </Text>

        <View sx={{ mt: '$8', gap: 32 }}>
          {administered.map((order) => (
            <ScheduleSection
              key={order.id}
              orderId={order.id}
              partnerName={order.partnerName ?? 'Unknown'}
              administeredAt={order.administeredAt!}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
