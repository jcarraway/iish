import { useLocalSearchParams } from 'expo-router';
import { JournalEntryScreen } from '@iish/app';
export default function JournalEntryRoute() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <JournalEntryScreen date={date} />;
}
