import Link from 'next/link';

export default function StartPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Let&apos;s get your cancer details</h1>
      <p className="mt-2 text-muted-foreground">
        Choose how you&apos;d like to share your medical information. We&apos;ll use it to match you with clinical trials.
      </p>
      <div className="mt-8 space-y-4">
        <Link
          href="/start/upload"
          className="block rounded-lg border p-6 hover:border-primary hover:bg-accent"
        >
          <h2 className="text-lg font-semibold">Upload your pathology report</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Take a photo or upload a PDF. Our AI extracts your details automatically.
          </p>
        </Link>
        <Link
          href="/start/mychart"
          className="block rounded-lg border p-6 hover:border-primary hover:bg-accent"
        >
          <h2 className="text-lg font-semibold">Connect MyChart</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pull your records automatically from your healthcare provider.
          </p>
        </Link>
        <Link
          href="/start/manual"
          className="block rounded-lg border p-6 hover:border-primary hover:bg-accent"
        >
          <h2 className="text-lg font-semibold">Enter details manually</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill out a form with your diagnosis information. Takes about 5 minutes.
          </p>
        </Link>
      </div>
    </div>
  );
}
