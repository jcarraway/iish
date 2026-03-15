export default function MyChartPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold">Connect MyChart</h1>
      <p className="mt-2 text-muted-foreground">
        Securely connect your MyChart account to automatically pull your medical records.
        We use FHIR to access only the data needed for trial matching.
      </p>
    </div>
  );
}
