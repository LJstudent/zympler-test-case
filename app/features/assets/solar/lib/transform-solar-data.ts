import type { EnergyDataRow } from "~/features/energy-data";
import {
  formatAssetBucket,
  groupAssetRows,
  type AssetAggregation,
  type AssetTimeView,
} from "../../shared";

import type { SolarChartDatum } from "../types/solar-types";
import { calculateSolarInterval } from "./calculate-solar-interval";

export function transformSolarData(
  rows: readonly EnergyDataRow[],
  view: AssetTimeView,
  aggregation: AssetAggregation,
  selectedPeriodKey: string,
): SolarChartDatum[] {
  return groupAssetRows(rows, view, aggregation, selectedPeriodKey).map((bucket) => {
    let totalSolar = 0;
    let ownUse = 0;
    let solarToCharger = 0;
    let solarToBattery = 0;
    let solarToGrid = 0;

    for (const row of bucket.rows) {
      const interval = calculateSolarInterval(row);
      totalSolar += interval.productionKwh;
      ownUse += interval.ownUseKwh;
      solarToCharger += interval.toChargerKwh;
      solarToBattery += interval.toBatteryKwh;
      solarToGrid += interval.toGridKwh;
    }

    return {
      timestamp: new Date(bucket.timestampMs).toISOString(),
      timestampMs: bucket.timestampMs,
      intervalEndMs: bucket.intervalEndMs,
      label: formatAssetBucket(new Date(bucket.timestampMs), view, aggregation),
      totalSolar,
      ownUse,
      solarToCharger,
      solarToBattery,
      solarToGrid,
    };
  });
}
