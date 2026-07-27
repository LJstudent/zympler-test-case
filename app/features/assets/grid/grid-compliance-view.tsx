import { Activity, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import type { EnergyDataRow } from "~/features/energy-data";

import {
  BREAKDOWN_GRID_SERIES,
  DEFAULT_GRID_SERIES,
  GRID_EXPLANATIONS,
} from "./constants/grid-constants";
import { GridChart } from "./components/grid-chart";
import { GridKpiPlaceholder } from "./components/grid-kpi-placeholder";
import { GridLegend } from "./components/grid-legend";
import { GridToolbar } from "./components/grid-toolbar";
import { GridViolationsPanel } from "./components/grid-violations-panel";
import { useGridView } from "./hooks/use-grid-view";

type GridComplianceViewProps = {
  rows: readonly EnergyDataRow[];
};

export function GridComplianceView({ rows }: GridComplianceViewProps) {
  const grid = useGridView(rows);
  const { selection } = grid;
  const series = selection.breakdown ? BREAKDOWN_GRID_SERIES : DEFAULT_GRID_SERIES;
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

  return (
    <div className="min-w-0 animate-grid-detail-in space-y-6 py-4 sm:px-2 lg:py-6 xl:px-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/"
            className="mb-4 inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-slate-500 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Zympler Overview
          </Link>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-[0_6px_18px_rgb(0_62_208_/_0.18)]">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">Grid</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Import, export and contracted-capacity performance
              </p>
            </div>
          </div>
        </div>
      </header>

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
              {grid.chartData.length.toLocaleString("en")} bars
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
                  series={series}
                  metric={selection.metric}
                  timeView={selection.timeView}
                  breakdown={selection.breakdown}
                  animationKey={animationKey}
                  highlightedTimestampMs={highlightedTimestampMs}
                />
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <GridLegend series={series} />
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

      <GridKpiPlaceholder />
    </div>
  );
}
