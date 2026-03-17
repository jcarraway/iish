import { Platform, Linking } from 'react-native';

export function openExternalUrl(url: string): void {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  Linking.openURL(url);
}
