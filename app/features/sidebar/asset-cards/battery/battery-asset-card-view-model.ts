import type { EnergyDataRow } from "~/features/energy-data";

import {
  filterAssetRowsByDate,
  formatAssetEnergy,
  getLatestAssetDate,
  readNonNegativeEnergy,
  sortAssetRowsChronologically,
} from "../../data/asset-card-data";

export interface BatteryActivityPoint {
  timestamp: number;
  batteryActivityKwh: number;
}

export interface BatteryAssetCardViewModel {
  activity: BatteryActivityPoint[];
  energyShiftedDisplay: string;
}

// The parsed domain model stores both battery flows as interval energy in kWh.
export function readBatteryChargeEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.batteryChargeKwh);
}

export function readBatteryDischargeEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.batteryDischargeKwh);
}

function hasValidBatteryMeasurement(row: EnergyDataRow): boolean {
  return readBatteryChargeEnergy(row) !== null && readBatteryDischargeEnergy(row) !== null;
}

export function buildSignedBatteryActivity(rows: readonly EnergyDataRow[]): BatteryActivityPoint[] {
  return rows.flatMap((row) => {
    const chargedKwh = readBatteryChargeEnergy(row);
    const dischargedKwh = readBatteryDischargeEnergy(row);

    return chargedKwh === null || dischargedKwh === null
      ? []
      : [
          {
            timestamp: row.start.getTime(),
            batteryActivityKwh: chargedKwh - dischargedKwh,
          },
        ];
  });
}

export function calculateDailyEnergyShifted(rows: readonly EnergyDataRow[]): number {
  let totalEnergyShifted = 0;

  for (const row of rows) {
    const chargedKwh = readBatteryChargeEnergy(row);
    const dischargedKwh = readBatteryDischargeEnergy(row);

    if (chargedKwh !== null && dischargedKwh !== null) {
      totalEnergyShifted += chargedKwh + dischargedKwh;
    }
  }

  return Number.isFinite(totalEnergyShifted) ? totalEnergyShifted : 0;
}

export function createBatteryAssetCardViewModel(
  rows: readonly EnergyDataRow[],
): BatteryAssetCardViewModel | null {
  const latestDate = getLatestAssetDate(rows, hasValidBatteryMeasurement);

  if (latestDate === null) {
    return null;
  }

  const latestRows = sortAssetRowsChronologically(
    filterAssetRowsByDate(rows, latestDate, hasValidBatteryMeasurement),
  );
  const dailyEnergyShifted = calculateDailyEnergyShifted(latestRows);

  return {
    activity: buildSignedBatteryActivity(latestRows),
    energyShiftedDisplay: formatAssetEnergy(dailyEnergyShifted),
  };
}
