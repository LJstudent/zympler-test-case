import { describe, expect, it, vi } from "vitest";

import type { EnergyDataRow } from "~/features/energy-data";

import {
  calculateDailyChargedEnergy,
  calculateDailyDirectSolarEnergy,
  calculateDirectSolarPercentage,
  createChargerAssetCardViewModel,
} from "./charger-asset-card-view-model";

function chargerRow(
  start: string,
  chargerEnergyKwh: number,
  directSolarKwh: number,
  batterySolarToChargerKwh = 0,
): EnergyDataRow {
  return {
    start: new Date(start),
    end: new Date(new Date(start).getTime() + 15 * 60 * 1_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: {
        toBatteryKwh: 0,
        toGridKwh: 0,
        toChargerKwh: directSolarKwh,
      },
      grid: { toBatteryKwh: 0, toChargerKwh: 0 },
      battery: {
        solarOrigin: {
          toGridKwh: 0,
          toChargerKwh: batterySolarToChargerKwh,
        },
        gridOrigin: { toGridKwh: 0, toChargerKwh: 0 },
      },
      charger: { totalFromSolarKwh: 0, totalFromGridKwh: 0 },
    },
  };
}

describe("charger asset card view model", () => {
  it("uses only the latest valid day and sorts chart activity chronologically", () => {
    const viewModel = createChargerAssetCardViewModel([
      chargerRow("2025-12-31T00:15:00Z", 1_000, 111.2),
      chargerRow("2025-12-30T23:45:00Z", 500, 500),
      chargerRow("2025-12-31T00:00:00Z", 1_840, 400),
      chargerRow("2026-01-01T00:00:00Z", -1, 0),
    ]);

    expect(viewModel?.activity).toEqual([
      {
        timestamp: new Date("2025-12-31T00:00:00Z").getTime(),
        chargedKwh: 1_840,
      },
      {
        timestamp: new Date("2025-12-31T00:15:00Z").getTime(),
        chargedKwh: 1_000,
      },
    ]);
    expect(viewModel).toMatchObject({
      chargedDisplay: "2.84 MWh",
      solarDisplay: "18%",
      hasConsistentSourceData: true,
    });
  });

  it("calculates direct solar independently and excludes battery-origin energy", () => {
    const rows = [
      chargerRow("2025-12-31T00:00:00Z", 80, 10, 60),
      chargerRow("2025-12-31T00:15:00Z", 20, 10, 20),
    ];

    expect(calculateDailyChargedEnergy(rows)).toBe(100);
    expect(calculateDailyDirectSolarEnergy(rows)).toBe(20);
    expect(calculateDirectSolarPercentage(100, 20)).toBe(20);
  });

  it("shows zero percent for valid charging without direct solar", () => {
    const viewModel = createChargerAssetCardViewModel([
      chargerRow("2025-12-31T00:00:00Z", 842.45, 0),
    ]);

    expect(viewModel).toMatchObject({
      chargedDisplay: "842.5 kWh",
      solarDisplay: "0%",
    });
  });

  it("handles no energy and inconsistent source totals defensively", () => {
    expect(
      createChargerAssetCardViewModel([chargerRow("2025-12-31T00:00:00Z", Number.NaN, 0)]),
    ).toBeNull();

    expect(
      createChargerAssetCardViewModel([chargerRow("2025-12-31T00:00:00Z", 0, 0)]),
    ).toMatchObject({ chargedDisplay: "0 kWh", solarDisplay: "—" });

    const consoleWarning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const inconsistentViewModel = createChargerAssetCardViewModel([
      chargerRow("2025-12-31T00:00:00Z", 10, 12),
    ]);

    expect(inconsistentViewModel).toMatchObject({
      solarDisplay: "100%",
      hasConsistentSourceData: false,
    });
    expect(consoleWarning).toHaveBeenCalledWith(
      "Direct solar-to-charger energy exceeds total charged energy for the latest day.",
    );
    consoleWarning.mockRestore();
  });
});
