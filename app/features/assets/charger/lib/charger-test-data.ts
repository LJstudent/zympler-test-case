import type { EnergyDataRow } from "~/features/energy-data";

export function createChargerTestRow({
  start = "2025-01-01T00:00:00Z",
  totalChargedKwh = 100,
  totalSolarToChargerKwh = 25,
  solarToChargerKwh = 20,
  batterySolarToChargerKwh = 5,
  batteryGridToChargerKwh = 15,
  gridToChargerKwh = 60,
}: {
  start?: string;
  totalChargedKwh?: number;
  totalSolarToChargerKwh?: number;
  solarToChargerKwh?: number;
  batterySolarToChargerKwh?: number;
  batteryGridToChargerKwh?: number;
  gridToChargerKwh?: number;
} = {}): EnergyDataRow {
  const startDate = new Date(start);
  return {
    start: startDate,
    end: new Date(startDate.getTime() + 15 * 60_000),
    measurement: {
      hbe: 0,
      pricePerKwh: null,
      gridImportKwh: 0,
      gridExportKwh: 0,
      solarGenerationKwh: 0,
      batteryChargeKwh: 0,
      batteryDischargeKwh: 0,
      chargerEnergyKwh: totalChargedKwh,
      batterySoc: { solarOrigin: null, gridOrigin: null },
    },
    flows: {
      solar: {
        toBatteryKwh: 0,
        toGridKwh: 0,
        toChargerKwh: solarToChargerKwh,
      },
      grid: { toBatteryKwh: 0, toChargerKwh: gridToChargerKwh },
      battery: {
        solarOrigin: { toGridKwh: 0, toChargerKwh: batterySolarToChargerKwh },
        gridOrigin: { toGridKwh: 0, toChargerKwh: batteryGridToChargerKwh },
      },
      charger: {
        totalFromSolarKwh: totalSolarToChargerKwh,
        totalFromGridKwh: Math.max(totalChargedKwh - totalSolarToChargerKwh, 0),
      },
    },
  };
}
