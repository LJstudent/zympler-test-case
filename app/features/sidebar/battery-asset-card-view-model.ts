import type { EnergyDataRow } from "~/features/energy-data";

import {
  filterAssetRowsByDate,
  getLatestAssetDate,
  readNonNegativeEnergy,
  sortAssetRowsChronologically,
} from "./asset-card-data";

const BATTERY_PROFIT_FORMATTER = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export interface BatteryActivityPoint {
  timestamp: number;
  batteryActivityKwh: number;
}

export interface BatteryAssetCardViewModel {
  activity: BatteryActivityPoint[];
  profitDisplay: string;
}

// The parsed domain model stores both battery flows as interval energy in kWh.
export function readBatteryChargeEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.batteryChargeKwh);
}

export function readBatteryDischargeEnergy(row: EnergyDataRow): number | null {
  return readNonNegativeEnergy(row.measurement.batteryDischargeKwh);
}

export function readMarketPricePerKwh(row: EnergyDataRow): number | null {
  const price = row.measurement.pricePerKwh;
  return price !== null && Number.isFinite(price) ? price : null;
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

export function calculateIntervalBatteryProfit(row: EnergyDataRow): number | null {
  const chargedKwh = readBatteryChargeEnergy(row);
  const dischargedKwh = readBatteryDischargeEnergy(row);
  const pricePerKwh = readMarketPricePerKwh(row);

  if (chargedKwh === null || dischargedKwh === null || pricePerKwh === null) {
    return null;
  }

  const intervalProfit = dischargedKwh * pricePerKwh - chargedKwh * pricePerKwh;

  return Number.isFinite(intervalProfit) ? intervalProfit : null;
}

export function calculateDailyBatteryProfit(rows: readonly EnergyDataRow[]): number | null {
  let pricedIntervalCount = 0;
  let dailyProfit = 0;

  for (const row of rows) {
    const intervalProfit = calculateIntervalBatteryProfit(row);

    if (intervalProfit !== null) {
      dailyProfit += intervalProfit;
      pricedIntervalCount += 1;
    }
  }

  return pricedIntervalCount > 0 && Number.isFinite(dailyProfit) ? dailyProfit : null;
}

export function formatBatteryProfit(profit: number): string {
  const safeProfit = Number.isFinite(profit) && !Object.is(profit, -0) ? profit : 0;
  return BATTERY_PROFIT_FORMATTER.format(safeProfit).replace("-", "−");
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
  const dailyProfit = calculateDailyBatteryProfit(latestRows);

  return {
    activity: buildSignedBatteryActivity(latestRows),
    profitDisplay: dailyProfit === null ? "—" : formatBatteryProfit(dailyProfit),
  };
}
