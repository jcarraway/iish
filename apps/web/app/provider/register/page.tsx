'use client';

import { useState } from 'react';

export default function ProviderRegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    type: 'academic_medical_center' as string,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    canAdministerMrna: false,
    hasInfusionCenter: false,
    hasEmergencyResponse: false,
    hasMonitoringCapacity: false,
    investigationalExp: false,
    irbAffiliation: '',
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-green-900">Registration Received</h2>
          <p className="mt-2 text-sm text-green-800">
            Thank you for registering your facility. Our team will verify your information
            and you&apos;ll be listed in our provider directory once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Register Your Facility</h1>
      <p className="mt-2 text-gray-600">
        Join our network of administration sites for personalized cancer vaccines.
        Your facility will be verified by our team before appearing in the directory.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Facility info */}
        <div>
          <h2 className="font-semibold text-gray-900">Facility Information</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Facility name</label>
              <input type="text" required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <option value="academic_medical_center">Academic Medical Center</option>
                <option value="community_oncology">Community Oncology</option>
                <option value="infusion_center">Infusion Center</option>
                <option value="hospital">Hospital</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="font-semibold text-gray-900">Contact</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact name</label>
              <input type="text" required value={form.contactName} onChange={(e) => update('contactName', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" required value={form.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" value={form.contactPhone} onChange={(e) => update('contactPhone', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Website</label>
              <input type="url" value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="font-semibold text-gray-900">Address</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Street address</label>
              <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input type="text" required value={form.city} onChange={(e) => update('city', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input type="text" required value={form.state} onChange={(e) => update('state', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ZIP code</label>
              <input type="text" required value={form.zip} onChange={(e) => update('zip', e.target.value)} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <h2 className="font-semibold text-gray-900">Capabilities</h2>
          <div className="mt-3 space-y-2">
            {[
              { key: 'canAdministerMrna', label: 'Can administer mRNA-based therapies' },
              { key: 'hasInfusionCenter', label: 'Has dedicated infusion center' },
              { key: 'hasEmergencyResponse', label: 'Has on-site emergency response' },
              { key: 'hasMonitoringCapacity', label: 'Has post-administration monitoring capacity' },
              { key: 'investigationalExp', label: 'Experience with investigational products' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => update(key, e.target.checked)}
                  className="rounded border-gray-300"
                />
                {label}
              </label>
            ))}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">IRB affiliation (optional)</label>
              <input type="text" value={form.irbAffiliation} onChange={(e) => update('irbAffiliation', e.target.value)} placeholder="e.g., Western IRB, institutional IRB" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Register Facility'}
        </button>
      </form>
    </div>
  );
}
