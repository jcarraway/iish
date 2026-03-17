import { useLocalSearchParams } from 'expo-router';
import { FinancialProgramScreen } from '@oncovax/app';

export default function FinancialProgramPage() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  return <FinancialProgramScreen programId={programId!} />;
}
