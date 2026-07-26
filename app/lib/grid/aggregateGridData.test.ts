import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import { aggregateGridData } from "./aggregateGridData";

function row(timestamp: string, importKwh: number, exportKwh: number): EnergyDataRow {
  const start = new Date(timestamp);

  return {
    start,
    end: new Date(start.getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh: importKwh,
      gridExportKwh: exportKwh,
      solarGenerationKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: 0,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: { toBatteryKwh: 0, toGridKwh: exportKwh, toChargerKwh: 0 },
      grid: { toBatteryKwh: importKwh / 2, toChargerKwh: importKwh / 2 },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: importKwh / 2 },
    },
  };
}

describe("aggregateGridData", () => {
  it("aggregates year data into one bucket per UTC day", () => {
    const result = aggregateGridData(
      [
        row("2025-01-01T00:00:00Z", 10, 2),
        row("2025-01-01T00:15:00Z", 12, 3),
        row("2025-01-02T00:00:00Z", 8, 1),
      ],
      "year",
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      gridImport: 22,
      gridExport: 5,
      gridToCharger: 11,
      gridToBattery: 11,
    });
  });

  it("keeps 15 minute intervals separate for the day view", () => {
    const result = aggregateGridData(
      [row("2025-01-02T10:00:00Z", 10, 2), row("2025-01-02T10:15:00Z", 12, 3)],
      "day",
    );

    expect(result).toHaveLength(2);
    expect(result.map((datum) => datum.gridImport)).toEqual([10, 12]);
  });
});
