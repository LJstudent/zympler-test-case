import type { ContentState } from "~/components/ui/content-state";
import type { EnergyDataRow, EnergyTotals } from "~/features/energy-data";
import { DashboardOnboarding } from "~/features/onboarding";
import { OverviewSection } from "~/features/overview";
import { ResponsiveDashboardSidebar } from "~/features/sidebar";
import { SystemStatusSection } from "~/features/system-status";

type DashboardLayoutProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  totals?: EnergyTotals;
  rows?: readonly EnergyDataRow[];
};

export function DashboardLayout({
  state = "ready",
  errorMessage,
  onRetry,
  totals,
  rows,
}: DashboardLayoutProps) {
  const overviewState = state === "ready" && totals === undefined ? "empty" : state;

  return (
    <main className="min-h-dvh bg-white p-3 sm:p-4">
      <div className="mx-auto grid w-full max-w-[112rem] gap-6 lg:grid-cols-[minmax(17rem,25%)_minmax(0,1fr)]">
        <ResponsiveDashboardSidebar state={state} rows={rows} />

        <div className="min-w-0 space-y-12 px-1 py-4 sm:px-2 lg:py-6 xl:px-4">
          <SystemStatusSection state={state} errorMessage={errorMessage} onRetry={onRetry} />
          <OverviewSection
            state={overviewState}
            errorMessage={errorMessage}
            onRetry={onRetry}
            totals={totals}
            rows={rows}
          />
        </div>
      </div>
      <DashboardOnboarding />
    </main>
  );
}
