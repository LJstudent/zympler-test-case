import { useMemo } from "react";

import { Card, CardTitle } from "~/components/ui/card";
import { EmptyState, ErrorState } from "~/components/ui/content-state";
import type { ContentState } from "~/components/ui/content-state";
import { Skeleton } from "~/components/ui/skeleton";
import type { EnergyDataRow, EnergyTotals } from "~/features/energy-data";

import {
  calculateGridComplianceKpi,
  GRID_MEASUREMENT_UNIT,
  GridComplianceCard,
  GridComplianceSkeleton,
  SITE_GRID_CAPACITY_LIMITS,
} from "./grid-compliance";
import {
  calculateSmartChargingKpi,
  SmartChargingCard,
  SmartChargingSkeleton,
} from "./smart-charging";
import {
  calculateSolarChargingKpi,
  SolarPoweredChargingCard,
  SolarPoweredChargingSkeleton,
} from "./solar-charging";

type OverviewSectionProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  totals?: EnergyTotals;
  rows?: readonly EnergyDataRow[];
};

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SolarPoweredChargingSkeleton />
      <GridComplianceSkeleton />
      <SmartChargingSkeleton />
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
  const solarKpi = useMemo(
    () => (totals === undefined ? undefined : calculateSolarChargingKpi(totals)),
    [totals],
  );
  const gridKpi = useMemo(
    () =>
      rows === undefined
        ? undefined
        : calculateGridComplianceKpi(rows, SITE_GRID_CAPACITY_LIMITS, GRID_MEASUREMENT_UNIT),
    [rows],
  );
  const smartChargingKpi = useMemo(
    () => (rows === undefined ? undefined : calculateSmartChargingKpi(rows)),
    [rows],
  );

  return (
    <section
      aria-labelledby="zympler-overview-heading"
      aria-busy={state === "loading"}
      className="space-y-6 p-5"
    >
      <div id="zympler-overview-heading">
        {state === "loading" ? (
          <Skeleton className="h-7 w-40" />
        ) : (
          <CardTitle className="text-lg tracking-[-0.025em]">Zympler overview</CardTitle>
        )}
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
        gridKpi !== undefined &&
        smartChargingKpi !== undefined && (
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SolarPoweredChargingCard totals={totals} kpi={solarKpi} />
            <GridComplianceCard kpi={gridKpi} />
            <SmartChargingCard kpi={smartChargingKpi} />
          </div>
        )}
    </section>
  );
}
