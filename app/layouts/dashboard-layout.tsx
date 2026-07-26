import type { ContentState } from "~/components/ui/content-state";
import type { EnergyDataRow, EnergyTotals } from "~/features/energy-data";
import { OverviewSection } from "~/features/overview";
import { DashboardSidebar } from "~/features/sidebar";
import { SystemStatusSection } from "~/features/system-status";
import { GridComplianceView } from "~/features/assets/grid";

type DashboardLayoutProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  totals?: EnergyTotals;
  rows?: readonly EnergyDataRow[];
  activePage?: "overview" | "grid";
};

export function DashboardLayout({
  state = "ready",
  errorMessage,
  onRetry,
  totals,
  rows,
  activePage = "overview",
}: DashboardLayoutProps) {
  const overviewState = state === "ready" && totals === undefined ? "empty" : state;

  return (
    <main className="min-h-dvh overflow-x-clip bg-white p-3 sm:p-4">
      <div className="mx-auto grid w-full max-w-[112rem] gap-6 lg:grid-cols-[minmax(17rem,25%)_minmax(0,1fr)]">
        <DashboardSidebar state={state} rows={rows} activePage={activePage} />

        <div className="dashboard-route-content min-w-0 px-1 py-4 sm:px-2 lg:py-6 xl:px-4">
          {activePage === "overview" ? (
            <div className="space-y-12">
              <SystemStatusSection state={state} errorMessage={errorMessage} onRetry={onRetry} />
              <OverviewSection
                state={overviewState}
                errorMessage={errorMessage}
                onRetry={onRetry}
                totals={totals}
                rows={rows}
              />
            </div>
          ) : (
            <GridComplianceView
              state={state}
              errorMessage={errorMessage}
              onRetry={onRetry}
              rows={rows}
            />
          )}
        </div>
      </div>
    </main>
  );
}
