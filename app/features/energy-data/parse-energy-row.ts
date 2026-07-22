import * as XLSX from "xlsx";

import type { EnergyColumnIndexes } from "./excel-columns";
import type { EnergyDataRow } from "./types";

export function parseExcelDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);

    if (parsed === null) {
      return null;
    }

    const milliseconds = Math.round((parsed.S % 1) * 1_000);
    const date = new Date(
      Date.UTC(
        parsed.y,
        parsed.m - 1,
        parsed.d,
        parsed.H,
        parsed.M,
        Math.trunc(parsed.S),
        milliseconds,
      ),
    );

    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function toNumberOrZero(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseEnergyRow(
  values: readonly unknown[],
  columns: EnergyColumnIndexes,
): EnergyDataRow | null {
  const start = parseExcelDate(values[columns.start]);
  const end = parseExcelDate(values[columns.end]);

  if (start === null || end === null) {
    return null;
  }

  return {
    start,
    end,
    measurement: {
      hbe: toNumberOrZero(values[columns.hbe]),
      pricePerKwh: toNullableNumber(values[columns.pricePerKwh]),
      gridImportKwh: toNullableNumber(values[columns.gridImport]),
      gridExportKwh: toNullableNumber(values[columns.gridExport]),
      solarGenerationKwh: toNumberOrZero(values[columns.solarGeneration]),
      batteryChargeKwh: toNumberOrZero(values[columns.batteryCharge]),
      batteryDischargeKwh: toNumberOrZero(values[columns.batteryDischarge]),
      chargerEnergyKwh: toNumberOrZero(values[columns.chargerEnergy]),
      batterySoc: {
        solarOrigin: toNullableNumber(values[columns.solarBatterySoc]),
        gridOrigin: toNullableNumber(values[columns.gridBatterySoc]),
      },
    },
    flows: {
      solar: {
        toBatteryKwh: toNumberOrZero(values[columns.solarToBattery]),
        toGridKwh: toNumberOrZero(values[columns.solarToGrid]),
        toChargerKwh: toNumberOrZero(values[columns.solarToCharger]),
      },
      grid: {
        toBatteryKwh: toNumberOrZero(values[columns.gridToBattery]),
        toChargerKwh: toNumberOrZero(values[columns.gridToCharger]),
      },
      battery: {
        solarOrigin: {
          toGridKwh: toNumberOrZero(values[columns.solarBatteryToGrid]),
          toChargerKwh: toNumberOrZero(values[columns.solarBatteryToCharger]),
        },
        gridOrigin: {
          toGridKwh: toNumberOrZero(values[columns.gridBatteryToGrid]),
          toChargerKwh: toNumberOrZero(values[columns.gridBatteryToCharger]),
        },
      },
      charger: {
        totalFromSolarKwh: toNumberOrZero(values[columns.totalSolarToCharger]),
        totalFromGridKwh: toNumberOrZero(values[columns.totalGridToCharger]),
      },
    },
  };
}
