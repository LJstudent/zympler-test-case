import { useId, useMemo, useState } from "react";

import batteryIcon from "~/assets/systems/battery.svg";
import { Card } from "~/components/ui/card";
import { EmptyState } from "~/components/ui/content-state";
import type { EnergyDataRow } from "~/features/energy-data";
import {
  AssetChartToolbar,
  AssetDetailHeader,
  formatAssetResolution,
  useAssetSeriesVisibility,
} from "../shared";

import { BATTERY_PROFIT_SERIES } from "./constants/battery-constants";
import { BatteryChart } from "./components/battery-chart";
import { BatteryKpiPanel } from "./components/battery-kpi-panel";
import { BatteryLegend } from "./components/battery-legend";
import { useBatteryView } from "./hooks/use-battery-view";
import {
  createBatteryChartSeries,
  getBatteryEnergySeries,
} from "./lib/create-battery-chart-series";

export function BatteryDetailView({ rows }: { rows: readonly EnergyDataRow[] }) {
  const battery = useBatteryView(rows);
  const { selection, presentation } = battery;
  const raw = selection.aggregation === "raw";
  const energySeries = getBatteryEnergySeries(selection.breakdown);
  const visibility = useAssetSeriesVisibility(energySeries);
  const [profitVisible, setProfitVisible] = useState(true);
  const visibleSeries = useMemo(
    () =>
      createBatteryChartSeries({
        aggregation: selection.aggregation,
        breakdown: selection.breakdown,
        hiddenEnergyKeys: visibility.hiddenKeys,
        profitVisible,
      }),
    [profitVisible, selection.aggregation, selection.breakdown, visibility.hiddenKeys],
  );
  const summaryId = useId();
  const animationKey = [
    selection.timeView,
    selection.aggregation,
    selection.breakdown,
    selection.periodKey,
    visibility.visibleSeries.map((item) => item.key).join(","),
    profitVisible,
  ].join("-");
  const chartDescription = raw
    ? selection.breakdown
      ? "Raw battery energy flows for each source interval. Battery charge is shown above zero and battery discharge below zero. Battery energy is split by source and destination."
      : "Raw battery energy flows for each source interval. Battery charge is shown above zero and battery discharge below zero."
    : selection.breakdown
      ? "Battery charge is shown above zero and battery discharge below zero, split by source and destination. The dashed line shows cumulative Profit."
      : "Battery charge is shown above zero and battery discharge below zero. The dashed line shows cumulative Profit.";

  return (
    <div className="min-w-0 animate-asset-detail-in space-y-6 py-4 sm:px-2 lg:py-6 xl:px-4">
      <AssetDetailHeader
        title="Battery"
        description="Energy movement and net financial performance"
        iconSrc={batteryIcon}
      />

      <Card className="overflow-hidden shadow-panel">
        <AssetChartToolbar
          timeView={selection.timeView}
          aggregation={selection.aggregation}
          breakdown={selection.breakdown}
          periodKey={selection.periodKey}
          periodOptions={battery.periodOptions}
          onTimeViewChange={battery.setTimeView}
          onAggregationChange={battery.setAggregation}
          onPeriodChange={battery.setPeriodKey}
          onBreakdownChange={battery.setBreakdown}
        />
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Battery energy</h2>
              <p className="mt-1 max-w-2xl text-xs text-slate-500">{chartDescription}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.6875rem] font-semibold text-slate-500">
              {formatAssetResolution(
                presentation.chartData.length,
                selection.timeView,
                selection.aggregation,
              )}
            </span>
          </div>

          <p id={summaryId} className="sr-only">
            {presentation.screenReaderSummary}
          </p>

          {presentation.chartData.length === 0 ? (
            <div className="grid min-h-[24rem] place-items-center">
              <EmptyState message="No data available for the selected period." />
            </div>
          ) : (
            <>
              <BatteryChart
                data={presentation.chartData}
                series={visibleSeries}
                timeView={selection.timeView}
                aggregation={selection.aggregation}
                breakdown={selection.breakdown}
                animationKey={animationKey}
                summaryId={summaryId}
              />
              <div className="mt-4 border-t border-slate-100 pt-4">
                <BatteryLegend
                  energySeries={energySeries}
                  profitSeries={raw ? undefined : BATTERY_PROFIT_SERIES}
                  hiddenEnergyKeys={visibility.hiddenKeys}
                  profitVisible={!raw && profitVisible}
                  onToggleEnergy={visibility.toggleSeries}
                  onToggleProfit={() => setProfitVisible((current) => !current)}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <BatteryKpiPanel
        periodLabel={battery.periodLabel}
        measurementCount={battery.analytics.measurementCount}
        showBreakdown={selection.breakdown}
        presentation={presentation}
      />
    </div>
  );
}
