import { View, Text, Pressable } from 'dripsy';
import { useRouter } from 'expo-router';

export default function UploadPlaceholder() {
  const router = useRouter();
  return (
    <View sx={{ flex: 1, justifyContent: 'center', alignItems: 'center', p: '$6', bg: 'background' }}>
      <Text sx={{ fontSize: 18, fontWeight: '600', color: 'text', mb: '$3', textAlign: 'center' }}>
        Document upload requires a web browser
      </Text>
      <Text sx={{ fontSize: 14, color: 'muted', mb: '$5', textAlign: 'center' }}>
        Please use the IISH website to upload pathology reports and medical documents.
      </Text>
      <Pressable
        onPress={() => router.back()}
        sx={{ bg: 'primary', px: '$5', py: '$3', borderRadius: 8 }}
      >
        <Text sx={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
      </Pressable>
    </View>
  );
}
