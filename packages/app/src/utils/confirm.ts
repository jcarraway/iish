import { Platform, Alert } from 'react-native';

export function confirmAction(message: string, onConfirm: () => void): void {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-restricted-globals
    if (confirm(message)) {
      onConfirm();
    }
    return;
  }
  Alert.alert('Confirm', message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'OK', onPress: onConfirm },
  ]);
}
