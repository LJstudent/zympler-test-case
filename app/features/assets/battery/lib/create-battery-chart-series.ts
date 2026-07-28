import {
  BATTERY_PROFIT_SERIES,
  BREAKDOWN_BATTERY_SERIES,
  COMBINED_BATTERY_SERIES,
} from "../constants/battery-constants";
import type {
  BatteryAggregation,
  BatteryChartSeries,
  BatteryEnergySeriesKey,
} from "../types/battery-types";

export function getBatteryEnergySeries(breakdown: boolean) {
  return breakdown ? BREAKDOWN_BATTERY_SERIES : COMBINED_BATTERY_SERIES;
}

export function createBatteryChartSeries({
  aggregation,
  breakdown,
  hiddenEnergyKeys,
  profitVisible,
}: {
  aggregation: BatteryAggregation;
  breakdown: boolean;
  hiddenEnergyKeys: ReadonlySet<BatteryEnergySeriesKey>;
  profitVisible: boolean;
}): BatteryChartSeries[] {
  const energy = getBatteryEnergySeries(breakdown).filter(
    (item) => !hiddenEnergyKeys.has(item.key),
  );
  if (aggregation === "raw" || !profitVisible) return [...energy];
  return [
    ...energy,
    {
      ...BATTERY_PROFIT_SERIES,
      showValueLabels: energy.length === 0,
    },
  ];
}
