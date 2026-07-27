import type { EnergyDataRow } from "~/features/energy-data";
import { GridComplianceView } from "~/features/assets/grid";
import { DashboardSidebar } from "~/features/sidebar";

export function GridDetailsLayout({ rows }: { rows: readonly EnergyDataRow[] }) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-white p-3 sm:p-4">
      <div className="mx-auto grid w-full max-w-[112rem] gap-6 lg:grid-cols-[minmax(17rem,25%)_minmax(0,1fr)]">
        <DashboardSidebar rows={rows} activePage="grid" />
        <GridComplianceView rows={rows} />
      </div>
    </main>
  );
}
