export default function TrialDetailPage({ params }: { params: Promise<{ trialId: string }> }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Trial details</h1>
      <p className="mt-2 text-muted-foreground">
        Full trial information including eligibility criteria, locations,
        intervention details, and your match breakdown.
      </p>
    </div>
  );
}
