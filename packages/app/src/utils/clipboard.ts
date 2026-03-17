import { Platform } from 'react-native';

export async function copyToClipboard(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  // Native: no-op for now — wire Clipboard API later
  return false;
}
