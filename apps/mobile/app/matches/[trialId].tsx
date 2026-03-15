import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TrialDetailScreen() {
  const { trialId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trial Details</Text>
      <Text style={styles.subtitle}>
        Full trial information and match breakdown.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});
