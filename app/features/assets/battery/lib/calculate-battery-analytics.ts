import type { EnergyDataRow } from "~/features/energy-data";
import { formatAssetBucket, groupAssetRows } from "../../shared";

import type {
  BatteryAggregation,
  BatteryAnalytics,
  BatteryAnalyticsPoint,
  BatteryInterval,
  BatteryTimeView,
  BatteryValidationIssue,
} from "../types/battery-types";

export const BATTERY_BALANCE_TOLERANCE_KWH = 0.001;

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function normalizeRoundingDifference(value: number): number {
  return Math.abs(value) <= BATTERY_BALANCE_TOLERANCE_KWH ? 0 : value;
}

function validationIssue(
  code: BatteryValidationIssue["code"],
  row: EnergyDataRow,
  differenceKwh: number,
): BatteryValidationIssue {
  const direction = code === "battery-import-mismatch" ? "import" : "export";
  return {
    code,
    timestamp: row.start,
    differenceKwh,
    message: `Battery ${direction} does not reconcile with its source flows at ${row.start.toISOString()} (difference ${differenceKwh.toFixed(6)} kWh).`,
  };
}

export function calculateBatteryInterval(row: EnergyDataRow): BatteryInterval {
  const batteryImportKwh = finite(row.measurement.batteryChargeKwh);
  const batteryExportKwh = finite(row.measurement.batteryDischargeKwh);
  const gridToBatteryKwh = finite(row.flows.grid.toBatteryKwh);
  const solarToBatteryKwh = finite(row.flows.solar.toBatteryKwh);
  const batteryToGridKwh =
    finite(row.flows.battery.solarOrigin.toGridKwh) +
    finite(row.flows.battery.gridOrigin.toGridKwh);
  const batteryToChargerKwh =
    finite(row.flows.battery.solarOrigin.toChargerKwh) +
    finite(row.flows.battery.gridOrigin.toChargerKwh);
  const batteryToOwnUseKwh = normalizeRoundingDifference(
    batteryExportKwh - batteryToGridKwh - batteryToChargerKwh,
  );
  const importDifference = normalizeRoundingDifference(
    batteryImportKwh - gridToBatteryKwh - solarToBatteryKwh,
  );
  const exportDifference = normalizeRoundingDifference(
    batteryExportKwh - batteryToGridKwh - batteryToChargerKwh - batteryToOwnUseKwh,
  );
  const validationIssues: BatteryValidationIssue[] = [];

  if (importDifference !== 0) {
    validationIssues.push(validationIssue("battery-import-mismatch", row, importDifference));
  }
  // A meaningful negative residual is an inconsistent destination balance. Keep
  // the value visible and report it instead of silently clamping it to zero.
  if (batteryToOwnUseKwh < -BATTERY_BALANCE_TOLERANCE_KWH || exportDifference !== 0) {
    validationIssues.push(
      validationIssue(
        "battery-export-mismatch",
        row,
        batteryToOwnUseKwh < 0 ? batteryToOwnUseKwh : exportDifference,
      ),
    );
  }

  const pricePerKwh = row.measurement.pricePerKwh;
  const revenueEur = pricePerKwh === null ? null : batteryToGridKwh * pricePerKwh;
  const savingsEur =
    pricePerKwh === null ? null : (batteryToChargerKwh + batteryToOwnUseKwh) * pricePerKwh;
  // Solar → Battery deliberately contributes no electricity purchase cost.
  const gridChargingCostsEur = pricePerKwh === null ? null : gridToBatteryKwh * pricePerKwh;
  const intervalProfitEur =
    revenueEur === null || savingsEur === null || gridChargingCostsEur === null
      ? null
      : revenueEur + savingsEur - gridChargingCostsEur;

  return {
    batteryImportKwh,
    batteryExportKwh,
    gridToBatteryKwh,
    solarToBatteryKwh,
    batteryToGridKwh,
    batteryToChargerKwh,
    batteryToOwnUseKwh,
    revenueEur,
    savingsEur,
    gridChargingCostsEur,
    intervalProfitEur,
    validationIssues,
  };
}

export function calculateBatteryAnalytics(
  rows: readonly EnergyDataRow[],
  view: BatteryTimeView,
  aggregation: BatteryAggregation,
  selectedPeriodKey: string,
): BatteryAnalytics {
  let cumulativeProfitEur = 0;
  let totalBatteryImportKwh = 0;
  let totalGridToBatteryKwh = 0;
  let totalSolarToBatteryKwh = 0;
  let totalBatteryExportKwh = 0;
  let totalBatteryToGridKwh = 0;
  let totalBatteryToChargerKwh = 0;
  let totalBatteryToOwnUseKwh = 0;
  let totalRevenueEur = 0;
  let totalSavingsEur = 0;
  let totalGridChargingCostsEur = 0;
  let hasCompletePricing = true;
  const validationIssues: BatteryValidationIssue[] = [];
  const buckets = groupAssetRows(rows, view, aggregation, selectedPeriodKey);

  const points: BatteryAnalyticsPoint[] = buckets.map((bucket) => {
    let batteryImport = 0;
    let batteryExport = 0;
    let gridToBattery = 0;
    let solarToBattery = 0;
    let batteryToGrid = 0;
    let batteryToCharger = 0;
    let batteryToOwnUse = 0;
    let revenueEur = 0;
    let savingsEur = 0;
    let gridChargingCostsEur = 0;
    let intervalProfitEur = 0;
    let bucketHasCompletePricing = true;

    for (const row of bucket.rows) {
      const interval = calculateBatteryInterval(row);
      batteryImport += interval.batteryImportKwh;
      batteryExport += interval.batteryExportKwh;
      gridToBattery += interval.gridToBatteryKwh;
      solarToBattery += interval.solarToBatteryKwh;
      batteryToGrid += interval.batteryToGridKwh;
      batteryToCharger += interval.batteryToChargerKwh;
      batteryToOwnUse += interval.batteryToOwnUseKwh;
      validationIssues.push(...interval.validationIssues);

      if (
        interval.revenueEur === null ||
        interval.savingsEur === null ||
        interval.gridChargingCostsEur === null ||
        interval.intervalProfitEur === null
      ) {
        bucketHasCompletePricing = false;
        hasCompletePricing = false;
      } else {
        revenueEur += interval.revenueEur;
        savingsEur += interval.savingsEur;
        gridChargingCostsEur += interval.gridChargingCostsEur;
        intervalProfitEur += interval.intervalProfitEur;
      }
    }

    totalBatteryImportKwh += batteryImport;
    totalGridToBatteryKwh += gridToBattery;
    totalSolarToBatteryKwh += solarToBattery;
    totalBatteryExportKwh += batteryExport;
    totalBatteryToGridKwh += batteryToGrid;
    totalBatteryToChargerKwh += batteryToCharger;
    totalBatteryToOwnUseKwh += batteryToOwnUse;

    if (bucketHasCompletePricing) {
      totalRevenueEur += revenueEur;
      totalSavingsEur += savingsEur;
      totalGridChargingCostsEur += gridChargingCostsEur;
      cumulativeProfitEur += intervalProfitEur;
    }

    return {
      timestamp: new Date(bucket.timestampMs).toISOString(),
      timestampMs: bucket.timestampMs,
      intervalEndMs: bucket.intervalEndMs,
      label: formatAssetBucket(new Date(bucket.timestampMs), view, aggregation),
      batteryImport,
      batteryExport: -batteryExport,
      gridToBattery,
      solarToBattery,
      batteryToGrid: -batteryToGrid,
      batteryToCharger: -batteryToCharger,
      batteryToOwnUse: -batteryToOwnUse,
      revenueEur: bucketHasCompletePricing ? revenueEur : null,
      savingsEur: bucketHasCompletePricing ? savingsEur : null,
      gridChargingCostsEur: bucketHasCompletePricing ? gridChargingCostsEur : null,
      intervalProfitEur: bucketHasCompletePricing ? intervalProfitEur : null,
      cumulativeProfit: bucketHasCompletePricing && hasCompletePricing ? cumulativeProfitEur : null,
    };
  });

  return {
    points,
    measurementCount: buckets.reduce((count, bucket) => count + bucket.rows.length, 0),
    totalBatteryImportKwh,
    totalGridToBatteryKwh,
    totalSolarToBatteryKwh,
    totalBatteryExportKwh,
    totalBatteryToGridKwh,
    totalBatteryToChargerKwh,
    totalBatteryToOwnUseKwh,
    totalRevenueEur: hasCompletePricing ? totalRevenueEur : null,
    totalSavingsEur: hasCompletePricing ? totalSavingsEur : null,
    totalGridChargingCostsEur: hasCompletePricing ? totalGridChargingCostsEur : null,
    totalProfitEur: hasCompletePricing
      ? totalRevenueEur + totalSavingsEur - totalGridChargingCostsEur
      : null,
    validationIssues,
  };
}
