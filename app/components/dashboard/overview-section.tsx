import type { ContentState } from "~/components/common/content-state";
import { EmptyState, ErrorState } from "~/components/common/content-state";
import { Card, CardTitle } from "~/components/ui/card";
import {
  GRID_MEASUREMENT_UNIT,
  SITE_GRID_CAPACITY_LIMITS,
} from "~/features/energy-data/grid-capacity-config";
import { calculateGridComplianceKpi } from "~/features/energy-data/grid-compliance-kpi";
import { calculateSolarChargingKpi } from "~/features/energy-data/solar-charging-kpi";
import type { EnergyDataRow, EnergyTotals } from "~/features/energy-data/types";

import { GridComplianceCard } from "./grid-compliance-card";
import { GridComplianceSkeleton } from "./grid-compliance-skeleton";
import { SolarPoweredChargingCard } from "./solar-powered-charging-card";
import { SolarPoweredChargingSkeleton } from "./solar-powered-charging-skeleton";

type OverviewSectionProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  totals?: EnergyTotals;
  rows?: readonly EnergyDataRow[];
};

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
      <SolarPoweredChargingSkeleton />
      <GridComplianceSkeleton />
    </div>
  );
}

export function OverviewSection({
  state = "empty",
  errorMessage,
  onRetry,
  totals,
  rows,
}: OverviewSectionProps) {
  const solarKpi = totals === undefined ? undefined : calculateSolarChargingKpi(totals);
  const gridKpi =
    rows === undefined
      ? undefined
      : calculateGridComplianceKpi(rows, SITE_GRID_CAPACITY_LIMITS, GRID_MEASUREMENT_UNIT);

  return (
    <section aria-labelledby="zympler-overview-heading" className="space-y-6">
      <div id="zympler-overview-heading">
        <CardTitle className="text-lg tracking-[-0.025em]">Zympler overview</CardTitle>
      </div>

      {state === "loading" && <OverviewSkeleton />}
      {state === "error" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="min-h-64 p-6 shadow-panel">
            <ErrorState
              message={errorMessage ?? "The overview KPI data could not be loaded."}
              onRetry={onRetry}
            />
          </Card>
        </div>
      )}
      {state === "empty" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="flex min-h-64 items-center justify-center p-6 shadow-panel">
            <EmptyState message="No overview data available." />
          </Card>
        </div>
      )}
      {state === "ready" &&
        totals !== undefined &&
        solarKpi !== undefined &&
        gridKpi !== undefined && (
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            <SolarPoweredChargingCard totals={totals} kpi={solarKpi} />
            <GridComplianceCard kpi={gridKpi} />
          </div>
        )}
    </section>
  );
}
