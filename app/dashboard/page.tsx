import { PolicyDashboard } from '@/components/policy-dashboard';

export default function Dashboard() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Insurance Policy Dashboard</h2>
          </div>
        </div>
        <PolicyDashboard />
      </div>
    </div>
  );
}
