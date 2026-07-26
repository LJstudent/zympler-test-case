import { describe, expect, it } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  buildSignedGridActivity,
  calculateDailyGridExport,
  calculateDailyGridImport,
  createGridAssetCardViewModel,
  filterGridRowsByDate,
  getLatestGridDate,
  sortGridRowsChronologically,
} from "./grid-asset-card-view-model";

function gridRow(
  start: string,
  gridImportKwh: number | null,
  gridExportKwh: number | null,
): EnergyDataRow {
  return {
    start: new Date(start),
    end: new Date(new Date(start).getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh,
      gridExportKwh,
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

describe("grid asset card view model", () => {
  it("selects the latest valid day dynamically and sorts without mutating rows", () => {
    const rows = [
      gridRow("2025-12-31T00:15:00Z", 1_000, 24),
      gridRow("2025-12-30T23:45:00Z", 50, 25),
      gridRow("2025-12-31T00:00:00Z", 820, 300),
      gridRow("2026-01-01T00:00:00Z", null, 4),
    ];
    const originalOrder = rows.map((row) => row.start.getTime());
    const latestDate = getLatestGridDate(rows);

    expect(latestDate?.toISOString()).toBe("2025-12-31T00:00:00.000Z");

    const latestRows = sortGridRowsChronologically(filterGridRowsByDate(rows, latestDate as Date));

    expect(latestRows.map((row) => row.start.toISOString())).toEqual([
      "2025-12-31T00:00:00.000Z",
      "2025-12-31T00:15:00.000Z",
    ]);
    expect(rows.map((row) => row.start.getTime())).toEqual(originalOrder);
  });

  it("builds signed activity and independent daily totals", () => {
    const rows = [gridRow("2025-12-31T00:00:00Z", 20, 5), gridRow("2025-12-31T00:15:00Z", 2, 8)];

    expect(buildSignedGridActivity(rows).map((point) => point.netGridKwh)).toEqual([15, -6]);
    expect(calculateDailyGridImport(rows)).toBe(22);
    expect(calculateDailyGridExport(rows)).toBe(13);
  });

  it("formats the latest day totals and returns empty for invalid measurements", () => {
    const viewModel = createGridAssetCardViewModel([
      gridRow("2025-12-31T00:00:00Z", 820, 300),
      gridRow("2025-12-31T00:15:00Z", 1_000, 24),
    ]);

    expect(viewModel).toMatchObject({
      importDisplay: "1.82 MWh",
      exportDisplay: "324 kWh",
    });
    expect(
      createGridAssetCardViewModel([gridRow("2025-12-31T00:00:00Z", Number.NaN, null)]),
    ).toBeNull();
  });
});
