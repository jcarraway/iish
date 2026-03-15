import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        Find personalized cancer vaccine trials
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Upload your pathology report or connect MyChart. Our AI matches you to enrolling
        personalized cancer vaccine clinical trials in seconds.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/start"
          className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Get Started
        </Link>
        <Link
          href="/learn"
          className="rounded-lg border px-8 py-3 text-sm font-medium hover:bg-accent"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
