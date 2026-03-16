'use client';

import Link from 'next/link';

const PATHWAYS = [
  {
    name: 'Clinical Trial Enrollment',
    description: 'The gold standard. Clinical trials provide access to investigational treatments with full safety monitoring, at no cost to the patient, and advance medical knowledge.',
    cost: '$0 — $25K',
    timeline: '~4 weeks',
    color: 'border-green-200 bg-green-50',
    textColor: 'text-green-700',
  },
  {
    name: 'FDA Expanded Access',
    description: 'Also called "compassionate use." The FDA allows access to investigational drugs for patients with serious or life-threatening conditions who have exhausted other options. Over 99% of requests are approved.',
    cost: '$50K — $200K',
    timeline: '~8 weeks',
    color: 'border-blue-200 bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    name: 'Right to Try',
    description: 'Federal law (2018) allowing patients with life-threatening conditions to access investigational treatments that have completed Phase I trials, without FDA approval. Requires manufacturer willingness.',
    cost: '$75K — $300K',
    timeline: '~6 weeks',
    color: 'border-purple-200 bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    name: 'Physician-Sponsored IND',
    description: 'Your physician files an Investigational New Drug application directly with the FDA. Most comprehensive pathway with full regulatory oversight, but requires the most time and documentation.',
    cost: '$100K — $400K',
    timeline: '~16 weeks',
    color: 'border-amber-200 bg-amber-50',
    textColor: 'text-amber-700',
  },
];

export default function RegulatoryLandingPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/manufacture" className="text-sm text-gray-500 hover:text-gray-700">
        &larr; Manufacturing
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-900">Regulatory Pathways</h1>
      <p className="mt-2 text-gray-600">
        There are several legal pathways to access a personalized cancer vaccine. Our AI advisor
        will recommend the best pathway based on your specific situation.
      </p>

      {/* Pathway Overview Cards */}
      <div className="mt-8 space-y-4">
        {PATHWAYS.map(p => (
          <div key={p.name} className={`rounded-xl border p-5 ${p.color}`}>
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <div className="text-right flex-shrink-0 ml-4">
                <p className={`text-sm font-semibold ${p.textColor}`}>{p.cost}</p>
                <p className="text-xs text-gray-500">{p.timeline}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{p.description}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900">Find Your Pathway</h2>
        <p className="mt-2 text-sm text-gray-600">
          Answer a few questions and our AI advisor will recommend the best regulatory pathway
          for your situation, generate the required documents, and guide you through next steps.
        </p>
        <Link
          href="/manufacture/regulatory/assessment"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start pathway assessment
        </Link>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          <strong>Disclaimer:</strong> This information is for educational purposes only and does not constitute
          legal or medical advice. Regulatory pathways vary by jurisdiction and individual circumstances.
          Always consult with qualified medical and legal professionals before pursuing any regulatory pathway.
        </p>
      </div>
    </div>
  );
}
