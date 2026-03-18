import { useLocalSearchParams } from 'expo-router';
import { JournalEntryScreen } from '@oncovax/app';
export default function JournalEntryRoute() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <JournalEntryScreen date={date} />;
}
