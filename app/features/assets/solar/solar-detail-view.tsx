import { useMemo } from "react";

import solarIcon from "~/assets/systems/solar.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import type { EnergyDataRow } from "~/features/energy-data";
import {
  AssetChart,
  AssetChartToolbar,
  AssetDetailHeader,
  AssetLegend,
  AssetTooltip,
  formatAssetResolution,
  selectAssetPeriodRows,
  useAssetSeriesVisibility,
} from "../shared";

import { BREAKDOWN_SOLAR_SERIES, DEFAULT_SOLAR_SERIES } from "./constants/solar-constants";
import { SolarKpiPanel } from "./components/solar-kpi-panel";
import { useSolarView } from "./hooks/use-solar-view";
import { calculateSolarKpis } from "./lib/calculate-solar-kpis";

export function SolarDetailView({ rows }: { rows: readonly EnergyDataRow[] }) {
  const solar = useSolarView(rows);
  const { selection } = solar;
  const series = selection.breakdown ? BREAKDOWN_SOLAR_SERIES : DEFAULT_SOLAR_SERIES;
  const visibility = useAssetSeriesVisibility(series);
  const selectedRows = useMemo(
    () => selectAssetPeriodRows(rows, selection.timeView, selection.periodKey),
    [rows, selection.periodKey, selection.timeView],
  );
  const kpis = useMemo(() => calculateSolarKpis(selectedRows), [selectedRows]);
  const selectedPeriodLabel =
    solar.periodOptions.find((option) => option.key === selection.periodKey)?.label ??
    "the selected period";
  const animationKey = [
    selection.timeView,
    selection.aggregation,
    selection.breakdown,
    selection.periodKey,
  ].join("-");

  return (
    <div className="min-w-0 animate-asset-detail-in space-y-6 py-4 sm:px-2 lg:py-6 xl:px-4">
      <AssetDetailHeader
        title="Solar"
        description="Production, local consumption and export performance"
        iconSrc={solarIcon}
      />

      <Card className="overflow-hidden shadow-panel">
        <AssetChartToolbar
          timeView={selection.timeView}
          aggregation={selection.aggregation}
          breakdown={selection.breakdown}
          periodKey={selection.periodKey}
          periodOptions={solar.periodOptions}
          onTimeViewChange={solar.setTimeView}
          onAggregationChange={solar.setAggregation}
          onPeriodChange={solar.setPeriodKey}
          onBreakdownChange={solar.setBreakdown}
        />
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Solar production</h2>
              <p className="mt-1 text-xs text-slate-500">
                {selection.breakdown
                  ? "Production split by direct use, charging, battery storage and grid export."
                  : "Total solar energy generated during each interval."}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-slate-500">
              {formatAssetResolution(
                solar.chartData.length,
                selection.timeView,
                selection.aggregation,
              )}
            </span>
          </div>

          {solar.chartData.length === 0 ? (
            <div className="grid min-h-[24rem] place-items-center">
              <EmptyState message="No data available for the selected period." />
            </div>
          ) : (
            <>
              <AssetChart
                data={solar.chartData}
                series={visibility.visibleSeries}
                timeView={selection.timeView}
                aggregation={selection.aggregation}
                breakdown={selection.breakdown}
                animationKey={animationKey}
                ariaLabel="Solar energy bar chart"
                yAxisStartsAtZero
                tooltip={
                  <AssetTooltip
                    series={visibility.visibleSeries}
                    metric="energy"
                    timeView={selection.timeView}
                    aggregation={selection.aggregation}
                    totals={
                      selection.breakdown
                        ? [{ key: "totalSolar", label: "Total production" }]
                        : undefined
                    }
                    totalsFirst={selection.breakdown}
                    hideZeroSeries={selection.breakdown}
                  />
                }
              />
              <div className="mt-4 border-t border-slate-100 pt-4">
                <AssetLegend
                  series={series}
                  hiddenKeys={visibility.hiddenKeys}
                  onToggle={visibility.toggleSeries}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <SolarKpiPanel
        periodLabel={selectedPeriodLabel}
        summary={kpis}
        showBreakdown={selection.breakdown}
      />
    </div>
  );
}
