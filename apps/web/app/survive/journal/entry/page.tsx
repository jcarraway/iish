'use client';
import { useSearchParams } from 'next/navigation';
import { JournalEntryScreen } from '@oncovax/app';

export default function Page() {
  const searchParams = useSearchParams();
  const date = searchParams.get('date') ?? undefined;
  return <JournalEntryScreen date={date} />;
}
