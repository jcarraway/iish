export default function ContactPage({ params }: { params: Promise<{ trialId: string }> }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Oncologist brief</h1>
      <p className="mt-2 text-muted-foreground">
        A summary you can share with your oncologist, including trial details
        and why this trial may be a good match for your diagnosis.
      </p>
    </div>
  );
}
