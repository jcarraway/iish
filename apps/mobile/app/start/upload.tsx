import { View, Text, StyleSheet } from 'react-native';

export default function UploadScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>
        Take a photo or upload a PDF of your pathology report.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
});
