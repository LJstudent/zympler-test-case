import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import { detectGridViolations } from "./detectGridViolations";

function measurementRow(importKwh: number, exportKwh: number): EnergyDataRow {
  const start = new Date("2025-03-18T14:15:00Z");

  return {
    start,
    end: new Date("2025-03-18T14:30:00Z"),
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
      solar: { toBatteryKwh: 0, toGridKwh: 0, toChargerKwh: 0 },
      grid: { toBatteryKwh: 0, toChargerKwh: 0 },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: 0 },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("detectGridViolations", () => {
  it("converts interval energy to power before comparing contracted limits", () => {
    const row = measurementRow(200, 130);
    const result = detectGridViolations([row], [Date.UTC(2025, 0, 1), Date.UTC(2026, 0, 1)]);

    expect(result).toEqual([
      {
        timestamp: row.start.getTime(),
        importKw: 800,
        exportKw: 520,
      },
    ]);
  });

  it("does not report measurements at or below the limits", () => {
    expect(
      detectGridViolations(
        [measurementRow(187.5, 125)],
        [Date.UTC(2025, 0, 1), Date.UTC(2026, 0, 1)],
      ),
    ).toEqual([]);
  });
});
