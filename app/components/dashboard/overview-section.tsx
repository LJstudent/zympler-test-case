import type { ContentState } from "~/components/common/content-state";
import { EmptyState, ErrorState } from "~/components/common/content-state";
import { Card } from "~/components/ui/card";
import { calculateSolarChargingKpi } from "~/features/energy-data/solar-charging-kpi";
import type { EnergyTotals } from "~/features/energy-data/types";

import { SectionHeading } from "./section-heading";
import { SolarPoweredChargingCard } from "./solar-powered-charging-card";
import { SolarPoweredChargingSkeleton } from "./solar-powered-charging-skeleton";

type OverviewSectionProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  totals?: EnergyTotals;
};

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SolarPoweredChargingSkeleton />
    </div>
  );
}

export function OverviewSection({
  state = "empty",
  errorMessage,
  onRetry,
  totals,
}: OverviewSectionProps) {
  const kpi = totals === undefined ? undefined : calculateSolarChargingKpi(totals);

  return (
    <section aria-labelledby="zympler-overview-heading" className="space-y-6">
      <div id="zympler-overview-heading">
        <SectionHeading>Zympler Overview</SectionHeading>
      </div>

      {state === "loading" && <OverviewSkeleton />}
      {state === "error" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="min-h-64 p-6 shadow-panel">
            <ErrorState
              message={errorMessage ?? "The overview KPI data could not be loaded."}
              onRetry={onRetry}
            />
          </Card>
        </div>
      )}
      {state === "empty" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card className="flex min-h-64 items-center justify-center p-6 shadow-panel">
            <EmptyState message="No overview data available." />
          </Card>
        </div>
      )}
      {state === "ready" && totals !== undefined && kpi !== undefined && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SolarPoweredChargingCard totals={totals} kpi={kpi} />
        </div>
      )}
    </section>
  );
}
