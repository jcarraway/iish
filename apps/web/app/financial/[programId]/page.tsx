'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { FinancialProgramEligibility } from '@oncovax/shared';

interface ProgramDetail {
  id: string;
  name: string;
  organization: string;
  type: string;
  assistanceCategories: string[];
  description: string | null;
  maxBenefitAmount: number | null;
  benefitDescription: string | null;
  eligibility: FinancialProgramEligibility;
  status: string;
  applicationProcess: string | null;
  applicationUrl: string | null;
  applicationPhone: string | null;
  requiredDocuments: string[];
  turnaroundTime: string | null;
  phone: string | null;
  website: string;
  email: string | null;
  hours: string | null;
}

interface MatchInfo {
  matchStatus: string;
  estimatedBenefit: string | null;
  matchReasoning: string | null;
  missingInfo: string[] | null;
  applicationStatus: string;
  notifyOnReopen: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  eligible: 'bg-green-100 text-green-800 border-green-200',
  likely_eligible: 'bg-blue-100 text-blue-800 border-blue-200',
  check_eligibility: 'bg-amber-100 text-amber-800 border-amber-200',
};

const STATUS_LABELS: Record<string, string> = {
  eligible: 'You appear eligible',
  likely_eligible: 'You are likely eligible',
  check_eligibility: 'Check your eligibility',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/financial/${programId}`);
        if (!res.ok) throw new Error('Failed to load program');
        const data = await res.json();
        setProgram(data.program);
        setMatch(data.match);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [programId]);

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/api/financial/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId }),
      });
      if (res.ok) {
        alert('You will be notified when this fund reopens.');
      }
    } catch {
      // Silently fail
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-red-600">{error ?? 'Program not found'}</p>
        <button onClick={() => router.push('/financial')} className="mt-4 text-sm text-blue-600 hover:text-blue-800">
          Back to financial assistance
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <button onClick={() => router.push('/financial')} className="mb-6 text-sm text-gray-500 hover:text-gray-700">
        &larr; Back to all programs
      </button>

      <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
      <p className="mt-1 text-sm text-gray-500">{program.organization}</p>

      {/* Match status banner */}
      {match && (
        <div className={`mt-4 rounded-lg border p-4 ${STATUS_COLORS[match.matchStatus] ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          <p className="font-semibold">{STATUS_LABELS[match.matchStatus] ?? match.matchStatus}</p>
          {match.matchReasoning && <p className="mt-1 text-sm">{match.matchReasoning}</p>}
          {match.estimatedBenefit && (
            <p className="mt-1 text-sm font-medium">Estimated benefit: {match.estimatedBenefit}</p>
          )}
        </div>
      )}

      {/* Description */}
      {program.description && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">About this program</h2>
          <p className="mt-2 text-gray-700 leading-relaxed">{program.description}</p>
        </div>
      )}

      {/* Benefit */}
      {program.benefitDescription && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase text-gray-500">What you get</h2>
          <p className="mt-2 text-gray-700">{program.benefitDescription}</p>
          {program.maxBenefitAmount && (
            <p className="mt-1 text-lg font-semibold text-green-700">Up to ${program.maxBenefitAmount.toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Eligibility */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Eligibility</h2>
        <div className="mt-2 space-y-2 text-sm text-gray-700">
          {program.eligibility.cancerTypes !== 'all' && (
            <p>Cancer types: {(program.eligibility.cancerTypes as string[]).join(', ')}</p>
          )}
          {program.eligibility.incomeLimit.fplPercentage && (
            <p>Income limit: {program.eligibility.incomeLimit.fplPercentage}% of Federal Poverty Level</p>
          )}
          {(program.eligibility.ageRange.min || program.eligibility.ageRange.max) && (
            <p>
              Age: {program.eligibility.ageRange.min ? `${program.eligibility.ageRange.min}+` : ''}
              {program.eligibility.ageRange.min && program.eligibility.ageRange.max ? ' to ' : ''}
              {program.eligibility.ageRange.max ? `up to ${program.eligibility.ageRange.max}` : ''}
            </p>
          )}
          {program.eligibility.insuranceTypes.length > 0 && (
            <p>Insurance: {program.eligibility.insuranceTypes.join(', ')}</p>
          )}
          {program.eligibility.citizenshipRequired && (
            <p>US citizenship or permanent residency required</p>
          )}
        </div>
      </div>

      {/* How to apply */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">How to apply</h2>
        <div className="mt-2 space-y-2 text-sm text-gray-700">
          {program.applicationProcess && (
            <p>Application method: {program.applicationProcess}</p>
          )}
          {program.turnaroundTime && (
            <p>Turnaround time: {program.turnaroundTime}</p>
          )}
          {program.requiredDocuments.length > 0 && (
            <div>
              <p className="font-medium">Required documents:</p>
              <ul className="mt-1 list-disc pl-4 space-y-1">
                {program.requiredDocuments.map((doc, i) => <li key={i}>{doc}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Contact</h2>
        <div className="mt-2 space-y-1 text-sm text-gray-700">
          <p>
            Website:{' '}
            <a href={program.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
              {program.website}
            </a>
          </p>
          {program.phone && <p>Phone: {program.phone}</p>}
          {program.email && <p>Email: {program.email}</p>}
          {program.hours && <p>Hours: {program.hours}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex gap-3">
        {program.status === 'open' || program.status === 'unknown' ? (
          program.applicationUrl ? (
            <a
              href={program.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Apply now
            </a>
          ) : (
            <a
              href={program.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              Visit website to apply
            </a>
          )
        ) : (
          <button
            onClick={handleSubscribe}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Notify me when fund reopens
          </button>
        )}
        {program.applicationPhone && (
          <a
            href={`tel:${program.applicationPhone}`}
            className="rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Call {program.applicationPhone}
          </a>
        )}
      </div>
    </div>
  );
}
