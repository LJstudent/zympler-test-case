import { useMemo, useState } from "react";

import { GridChart } from "~/components/grid/GridChart";
import { GridLegend } from "~/components/grid/GridLegend";
import { GridToolbar } from "~/components/grid/GridToolbar";
import { Card } from "~/components/ui/card";
import type { ContentState } from "~/components/ui/content-state";
import { EmptyState, ErrorState } from "~/components/ui/content-state";
import { Skeleton } from "~/components/ui/skeleton";
import type { EnergyDataRow } from "~/features/energy-data";
import { useGridChartData } from "~/hooks/useGridChartData";
import { useGridSeries } from "~/hooks/useGridSeries";
import { buildStackedSeries } from "~/lib/grid/buildStackedSeries";
import type { GridPeriod } from "~/types/grid-chart";

type GridComplianceViewProps = {
  state?: ContentState;
  errorMessage?: string;
  onRetry?: () => void;
  rows?: readonly EnergyDataRow[];
};

function GridChartSkeleton() {
  return (
    <Card className="overflow-hidden shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-100 p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-56 rounded-lg" />
      </div>
      <div className="flex h-[34rem] items-end gap-2 p-8">
        {Array.from({ length: 28 }, (_, index) => (
          <Skeleton
            key={index}
            className="flex-1 rounded-t-sm"
            style={{ height: `${22 + ((index * 37) % 62)}%` }}
          />
        ))}
      </div>
    </Card>
  );
}

export function GridComplianceView({
  state = "ready",
  errorMessage,
  onRetry,
  rows = [],
}: GridComplianceViewProps) {
  const [period, setPeriod] = useState<GridPeriod>("year");
  const chartData = useGridChartData(rows, period);
  const { series, activeSeries, visibleKeys, breakdownEnabled, setBreakdownEnabled, toggleSeries } =
    useGridSeries();
  const totals = useMemo(() => {
    const stacked = buildStackedSeries(chartData.data);
    return stacked.reduce(
      (result, datum) => ({
        importKwh: result.importKwh + datum.gridImport,
        exportKwh: result.exportKwh + Math.abs(datum.gridExport),
      }),
      { importKwh: 0, exportKwh: 0 },
    );
  }, [chartData.data]);

  if (state === "loading") {
    return <GridChartSkeleton />;
  }

  if (state === "error") {
    return (
      <Card className="flex min-h-[32rem] items-center justify-center p-6 shadow-panel">
        <ErrorState
          message={errorMessage ?? "The grid data could not be loaded."}
          onRetry={onRetry}
        />
      </Card>
    );
  }

  if (state === "empty" || rows.length === 0) {
    return (
      <Card className="flex min-h-[32rem] items-center justify-center p-6 shadow-panel">
        <EmptyState message="No grid data available." />
      </Card>
    );
  }

  return (
    <section aria-label="Grid detail" className="space-y-4">
      <Card className="overflow-hidden shadow-panel">
        <GridToolbar
          period={period}
          rangeLabel={chartData.rangeLabel}
          breakdownEnabled={breakdownEnabled}
          onPeriodChange={setPeriod}
          onBreakdownChange={setBreakdownEnabled}
        />
        <GridChart
          data={chartData.data}
          domain={chartData.domain}
          period={period}
          activeSeries={activeSeries}
          violations={chartData.violations}
        />
        <GridLegend series={series} visibleKeys={visibleKeys} onToggle={toggleSeries} />
      </Card>
      <p className="px-1 text-xs text-slate-400">
        {chartData.data.length.toLocaleString("en-GB")} intervals ·{" "}
        {chartData.violations.length.toLocaleString("en-GB")} limit violations ·{" "}
        {totals.importKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kWh imported ·{" "}
        {totals.exportKwh.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kWh exported
      </p>
    </section>
  );
}
