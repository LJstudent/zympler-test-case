import type { EnergyDataRow } from "~/features/energy-data";

import { CHARGER_BREAKDOWN_TOLERANCE_KWH } from "../constants/charger-constants";
import type { ChargerBreakdownValidationIssue } from "../types/charger-types";
import { calculateChargerInterval } from "./calculate-charger-interval";

export function validateChargerBreakdown(
  rows: readonly EnergyDataRow[],
  toleranceKwh = CHARGER_BREAKDOWN_TOLERANCE_KWH,
): ChargerBreakdownValidationIssue[] {
  return rows.flatMap((row) => {
    const interval = calculateChargerInterval(row);
    const breakdownTotalKwh =
      interval.solarToChargerKwh +
      interval.batterySolarToChargerKwh +
      interval.batteryGridToChargerKwh +
      interval.gridToChargerKwh;
    const differenceKwh = breakdownTotalKwh - interval.totalChargedKwh;

    return Math.abs(differenceKwh) <= Math.max(toleranceKwh, 0)
      ? []
      : [
          {
            timestamp: new Date(row.start.getTime()),
            totalChargedKwh: interval.totalChargedKwh,
            breakdownTotalKwh,
            differenceKwh,
          },
        ];
  });
}
