'use client';
import { useParams } from 'next/navigation';
import { FinancialProgramScreen } from '@oncovax/app';
export default function Page() {
  const { programId } = useParams<{ programId: string }>();
  return <FinancialProgramScreen programId={programId} />;
}
