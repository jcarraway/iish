export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Admin</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
