'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Partner {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  costRangeMin: number | null;
  costRangeMax: number | null;
}

interface PipelineJob {
  id: string;
  status: string;
  neoantigenCount: number | null;
  completedAt: string | null;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/manufacturing').then((r) => r.json()),
      fetch('/api/pipeline/jobs').then((r) => r.json()),
    ])
      .then(([partnerData, jobData]) => {
        setPartners(partnerData.partners ?? []);
        const completedJobs = (jobData.jobs ?? []).filter((j: PipelineJob) => j.status === 'completed');
        setJobs(completedJobs);
        if (completedJobs.length === 1) setSelectedJobId(completedJobs[0].id);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPartnerId || !selectedJobId || !consent) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/manufacturing/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          pipelineJobId: selectedJobId,
          message: message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create order');
      }

      const data = await res.json();
      router.push(`/manufacture/orders/${data.order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">New Manufacturing Order</h1>
        <div className="mt-8 flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">New Manufacturing Order</h1>
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <p className="font-medium text-amber-900">No completed vaccine blueprint found</p>
          <p className="mt-2 text-sm text-amber-800">
            A completed neoantigen pipeline job is required before placing a manufacturing order.
            The pipeline generates your personalized vaccine blueprint that manufacturers need.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">New Manufacturing Order</h1>
      <p className="mt-2 text-gray-600">Send your vaccine blueprint to a manufacturing partner</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Select partner */}
        <div>
          <label className="block text-sm font-medium text-gray-900">Manufacturing Partner</label>
          <select
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select a partner...</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.costRangeMin && p.costRangeMax
                  ? ` ($${(p.costRangeMin / 1000).toFixed(0)}K — $${(p.costRangeMax / 1000).toFixed(0)}K)`
                  : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Select pipeline job */}
        <div>
          <label className="block text-sm font-medium text-gray-900">Vaccine Blueprint</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            <option value="">Select a blueprint...</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                Pipeline #{j.id.slice(0, 8)} — {j.neoantigenCount ?? '?'} neoantigens
                {j.completedAt && ` (${new Date(j.completedAt).toLocaleDateString()})`}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-900">Message to manufacturer (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Any special requirements, timelines, or questions..."
            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          />
        </div>

        {/* Blueprint consent */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-amber-800">
              I understand that my anonymized vaccine blueprint will be shared with the selected
              manufacturing partner. No personally identifiable information will be included.
              The blueprint contains molecular specifications (mRNA sequences, epitopes, formulation
              parameters) needed for production.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !selectedPartnerId || !selectedJobId || !consent}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Creating order...' : 'Submit Order'}
        </button>
      </form>
    </div>
  );
}
