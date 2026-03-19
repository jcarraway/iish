'use client';

import { useEffect, useState } from 'react';

interface ReadingPlanItem {
  articleSlug: string;
  articleTitle: string;
  reason: string;
  priority: string;
}

interface ReadingPlan {
  readNow: ReadingPlanItem[];
  readSoon: ReadingPlanItem[];
  whenReady: ReadingPlanItem[];
}

function PlanSection({ title, items, emoji }: { title: string; items: ReadingPlanItem[]; emoji: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        {emoji} {title}
      </h2>
      {items.map((item) => (
        <a
          key={item.articleSlug}
          href={`/learn/${item.articleSlug}`}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: 12 }}
        >
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600 }}>{item.articleTitle}</div>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{item.reason}</div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function ReadingPlanPage() {
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { generateReadingPlan { readNow { articleSlug articleTitle reason priority } readSoon { articleSlug articleTitle reason priority } whenReady { articleSlug articleTitle reason priority } } }`,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setPlan(data?.data?.generateReadingPlan ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 896, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 30, fontWeight: 700 }}>Your Reading Plan</h1>
      <p style={{ color: '#6b7280', marginTop: 8, marginBottom: 32 }}>
        Personalized article recommendations based on your journey.
      </p>

      {loading && (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
          Building your personalized reading plan...
        </p>
      )}

      {plan && (
        <>
          <PlanSection title="Read Now" items={plan.readNow} emoji="&#128214;" />
          <PlanSection title="Read Soon" items={plan.readSoon} emoji="&#128203;" />
          <PlanSection title="When You're Ready" items={plan.whenReady} emoji="&#127793;" />
        </>
      )}

      {!loading && !plan && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 18, color: '#6b7280' }}>
            Complete your patient profile to get personalized reading recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
