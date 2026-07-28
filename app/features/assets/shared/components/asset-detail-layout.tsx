import type { ReactNode } from "react";

import type { EnergyDataRow } from "~/features/energy-data";
import { DashboardSidebar } from "~/features/sidebar";

export type AssetPage = "grid" | "solar" | "charger" | "battery";

export function AssetDetailLayout({
  rows,
  activePage,
  children,
}: {
  rows: readonly EnergyDataRow[];
  activePage: AssetPage;
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-white p-3 sm:p-4">
      <div className="mx-auto grid w-full max-w-[112rem] gap-6 lg:grid-cols-[minmax(17rem,25%)_minmax(0,1fr)]">
        <DashboardSidebar rows={rows} activePage={activePage} />
        {children}
      </div>
    </main>
  );
}
