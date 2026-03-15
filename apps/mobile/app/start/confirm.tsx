import { View, Text, StyleSheet } from 'react-native';

export default function ConfirmScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Details</Text>
      <Text style={styles.subtitle}>
        Review extracted information before finding trial matches.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});
