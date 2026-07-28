import { useMemo } from "react";

import chargerIcon from "~/assets/systems/charger.svg";
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

import { BREAKDOWN_CHARGER_SERIES, COMBINED_CHARGER_SERIES } from "./constants/charger-constants";
import { ChargerKpiPanel } from "./components/charger-kpi-panel";
import { useChargerView } from "./hooks/use-charger-view";
import { calculateChargerKpis } from "./lib/calculate-charger-kpis";

export function ChargerDetailView({ rows }: { rows: readonly EnergyDataRow[] }) {
  const charger = useChargerView(rows);
  const { selection } = charger;
  const series = selection.breakdown ? BREAKDOWN_CHARGER_SERIES : COMBINED_CHARGER_SERIES;
  const visibility = useAssetSeriesVisibility(series);
  const selectedRows = useMemo(
    () => selectAssetPeriodRows(rows, selection.timeView, selection.periodKey),
    [rows, selection.periodKey, selection.timeView],
  );
  const kpis = useMemo(() => calculateChargerKpis(selectedRows), [selectedRows]);
  const selectedPeriodLabel =
    charger.periodOptions.find((option) => option.key === selection.periodKey)?.label ??
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
        title="Charger"
        description="Charged energy and its source distribution"
        iconSrc={chargerIcon}
      />

      <Card className="overflow-hidden shadow-panel">
        <AssetChartToolbar
          timeView={selection.timeView}
          aggregation={selection.aggregation}
          breakdown={selection.breakdown}
          periodKey={selection.periodKey}
          periodOptions={charger.periodOptions}
          onTimeViewChange={charger.setTimeView}
          onAggregationChange={charger.setAggregation}
          onPeriodChange={charger.setPeriodKey}
          onBreakdownChange={charger.setBreakdown}
        />
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Charged energy</h2>
              <p className="mt-1 text-xs text-slate-500">
                {selection.breakdown
                  ? "Charged energy split by solar, battery origin and grid."
                  : "Total energy delivered to the chargers during each interval."}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-slate-500">
              {formatAssetResolution(
                charger.chartData.length,
                selection.timeView,
                selection.aggregation,
              )}
            </span>
          </div>

          {charger.chartData.length === 0 ? (
            <div className="grid min-h-[24rem] place-items-center">
              <EmptyState message="No data available for the selected period." />
            </div>
          ) : (
            <>
              <AssetChart
                data={charger.chartData}
                series={visibility.visibleSeries}
                timeView={selection.timeView}
                aggregation={selection.aggregation}
                breakdown={selection.breakdown}
                animationKey={animationKey}
                ariaLabel="Charger energy bar chart"
                yAxisStartsAtZero
                tooltip={
                  <AssetTooltip
                    series={visibility.visibleSeries}
                    metric="energy"
                    timeView={selection.timeView}
                    aggregation={selection.aggregation}
                    totals={
                      selection.breakdown
                        ? [{ key: "totalCharged", label: "Total charged" }]
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

      <ChargerKpiPanel
        periodLabel={selectedPeriodLabel}
        summary={kpis}
        showBreakdown={selection.breakdown}
      />
    </div>
  );
}
