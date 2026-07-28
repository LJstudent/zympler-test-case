import { AssetChart } from "../../shared";
import {
  formatBatteryAxisEnergy,
  formatBatteryAxisMoney,
  formatBatteryLineMoney,
} from "../lib/format-battery-presentation";
import type {
  BatteryAggregation,
  BatteryChartDatum,
  BatteryChartSeries,
  BatteryTimeView,
} from "../types/battery-types";
import { BatteryTooltip } from "./battery-tooltip";

type BatteryChartProps = {
  data: readonly BatteryChartDatum[];
  series: readonly BatteryChartSeries[];
  timeView: BatteryTimeView;
  aggregation: BatteryAggregation;
  breakdown: boolean;
  animationKey: string;
  summaryId: string;
};

export function BatteryChart({
  data,
  series,
  timeView,
  aggregation,
  breakdown,
  animationKey,
  summaryId,
}: BatteryChartProps) {
  return (
    <AssetChart
      data={data}
      series={series}
      timeView={timeView}
      aggregation={aggregation}
      breakdown={breakdown}
      animationKey={animationKey}
      ariaLabel={
        aggregation === "raw"
          ? "Raw battery import and export telemetry bar chart"
          : "Battery energy and cumulative Profit chart"
      }
      ariaDescribedBy={summaryId}
      leftYAxisTickFormatter={formatBatteryAxisEnergy}
      rightYAxisTickFormatter={formatBatteryAxisMoney}
      lineValueFormatter={formatBatteryLineMoney}
      tooltip={<BatteryTooltip breakdown={breakdown} series={series} raw={aggregation === "raw"} />}
    />
  );
}
