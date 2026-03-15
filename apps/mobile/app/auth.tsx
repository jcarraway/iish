import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';

export default function AuthScreen() {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to OncoVax</Text>
      <Text style={styles.subtitle}>
        Enter your email and we&apos;ll send you a magic link.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Send magic link</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, marginBottom: 16,
  },
  button: {
    backgroundColor: '#000', borderRadius: 8, padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
