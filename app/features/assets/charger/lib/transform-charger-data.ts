import type { EnergyDataRow } from "~/features/energy-data";
import {
  formatAssetBucket,
  groupAssetRows,
  type AssetAggregation,
  type AssetTimeView,
} from "../../shared";

import type { ChargerChartDatum } from "../types/charger-types";
import { calculateChargerInterval } from "./calculate-charger-interval";

export function transformChargerData(
  rows: readonly EnergyDataRow[],
  view: AssetTimeView,
  aggregation: AssetAggregation,
  selectedPeriodKey: string,
): ChargerChartDatum[] {
  return groupAssetRows(rows, view, aggregation, selectedPeriodKey).map((bucket) => {
    let totalCharged = 0;
    let solarToCharger = 0;
    let batterySolarToCharger = 0;
    let batteryGridToCharger = 0;
    let gridToCharger = 0;

    for (const row of bucket.rows) {
      const interval = calculateChargerInterval(row);
      totalCharged += interval.totalChargedKwh;
      solarToCharger += interval.solarToChargerKwh;
      batterySolarToCharger += interval.batterySolarToChargerKwh;
      batteryGridToCharger += interval.batteryGridToChargerKwh;
      gridToCharger += interval.gridToChargerKwh;
    }

    return {
      timestamp: new Date(bucket.timestampMs).toISOString(),
      timestampMs: bucket.timestampMs,
      intervalEndMs: bucket.intervalEndMs,
      label: formatAssetBucket(new Date(bucket.timestampMs), view, aggregation),
      totalCharged,
      solarToCharger,
      batterySolarToCharger,
      batteryGridToCharger,
      gridToCharger,
    };
  });
}
