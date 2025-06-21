import { IntegrationList } from "@/components/integration-list";

export default function IntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <IntegrationList />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}