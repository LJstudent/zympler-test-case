import { useMemo } from "react";

import gridIcon from "~/assets/systems/utility-pole.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import type { EnergyDataRow } from "~/features/energy-data";
import { AssetDetailHeader, useAssetSeriesVisibility } from "../shared";

import {
  BREAKDOWN_GRID_SERIES,
  DEFAULT_GRID_SERIES,
  GRID_EXPLANATIONS,
} from "./constants/grid-constants";
import { GridChart } from "./components/grid-chart";
import { GridKpiPanel } from "./components/grid-kpi-panel";
import { GridLegend } from "./components/grid-legend";
import { GridToolbar } from "./components/grid-toolbar";
import { GridViolationsPanel } from "./components/grid-violations-panel";
import { useGridView } from "./hooks/use-grid-view";
import { calculateGridKpis, selectGridPeriodRows } from "./lib/calculate-grid-kpis";
import { formatGridResolution } from "./lib/format-grid-resolution";

type GridComplianceViewProps = {
  rows: readonly EnergyDataRow[];
};

export function GridComplianceView({ rows }: GridComplianceViewProps) {
  const grid = useGridView(rows);
  const { selection } = grid;
  const series = selection.breakdown ? BREAKDOWN_GRID_SERIES : DEFAULT_GRID_SERIES;
  const seriesVisibility = useAssetSeriesVisibility(series);
  const highlightedTimestampMs = grid.violations
    .find((violation) => violation.id === grid.highlightedViolationId)
    ?.timestamp.getTime();
  const animationKey = [
    selection.timeView,
    selection.aggregation,
    selection.metric,
    selection.breakdown,
    selection.periodKey,
  ].join("-");
  const selectedRows = useMemo(
    () => selectGridPeriodRows(rows, selection.timeView, selection.periodKey),
    [rows, selection.periodKey, selection.timeView],
  );
  const kpiSummary = useMemo(() => calculateGridKpis(selectedRows), [selectedRows]);
  const selectedPeriodLabel =
    grid.periodOptions.find((option) => option.key === selection.periodKey)?.label ??
    "the selected period";

  return (
    <div className="min-w-0 animate-asset-detail-in space-y-6 py-4 sm:px-2 lg:py-6 xl:px-4">
      <AssetDetailHeader
        title="Grid"
        description="Import, export and contracted-capacity performance"
        iconSrc={gridIcon}
      />

      <Card className="overflow-hidden shadow-panel">
        <GridToolbar
          selection={selection}
          periodOptions={grid.periodOptions}
          onTimeViewChange={grid.setTimeView}
          onAggregationChange={grid.setAggregation}
          onMetricChange={grid.setMetric}
          onPeriodChange={grid.setPeriodKey}
          onBreakdownChange={grid.setBreakdown}
          onViolationsChange={grid.setShowViolations}
        />
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Grid {selection.metric === "power" ? "power" : "energy"}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                {selection.breakdown
                  ? GRID_EXPLANATIONS.signs
                  : "Grid import is above zero; grid export is below zero."}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-slate-500">
              {formatGridResolution(
                grid.chartData.length,
                selection.timeView,
                selection.aggregation,
              )}
            </span>
          </div>
          {grid.chartData.length === 0 ? (
            <div className="grid min-h-[24rem] place-items-center">
              <EmptyState message="No data available for the selected period." />
            </div>
          ) : (
            <div className={selection.showViolations ? "flex flex-col gap-5 lg:flex-row" : ""}>
              <div className="min-w-0 flex-1">
                <GridChart
                  data={grid.chartData}
                  series={seriesVisibility.visibleSeries}
                  metric={selection.metric}
                  timeView={selection.timeView}
                  aggregation={selection.aggregation}
                  breakdown={selection.breakdown}
                  animationKey={animationKey}
                  highlightedTimestampMs={highlightedTimestampMs}
                />
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <GridLegend
                    series={series}
                    hiddenKeys={seriesVisibility.hiddenKeys}
                    onToggle={seriesVisibility.toggleSeries}
                  />
                </div>
              </div>
              {selection.showViolations && (
                <GridViolationsPanel
                  violations={grid.violations}
                  highlightedId={grid.highlightedViolationId}
                  onSelect={grid.selectViolation}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      <GridKpiPanel
        timeView={selection.timeView}
        periodLabel={selectedPeriodLabel}
        summary={kpiSummary}
        showBreakdown={selection.breakdown}
      />
    </div>
  );
}
