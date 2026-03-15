'use client';

import { useRouter } from 'next/navigation';
import ManualIntakeWizard from '@/components/ManualIntakeWizard';
import type { PatientProfile } from '@oncovax/shared';

export default function ManualIntakePage() {
  const router = useRouter();

  const handleComplete = (profile: PatientProfile) => {
    sessionStorage.setItem('oncovax_manual_profile', JSON.stringify(profile));
    router.push('/start/confirm?path=manual');
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Enter your details</h1>
      <p className="mt-2 mb-8 text-sm text-gray-500">
        Fill out the form below with your cancer diagnosis details.
        This information helps us find the best trial matches for you.
      </p>
      <ManualIntakeWizard onComplete={handleComplete} />
    </div>
  );
}
