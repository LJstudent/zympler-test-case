export const EXCEL_COLUMNS = {
  start: "start",
  end: "eind",
  hbe: "HBE",
  pricePerKwh: "Price (kwh)",
  gridImport: "van net",
  gridExport: "naar net",
  solarGeneration: "van zon",
  batteryDischarge: "van batterij",
  batteryCharge: "naar batterij",
  chargerEnergy: "naar lader",
  solarToCharger: "zon → lader",
  solarToBattery: "zon → batterij",
  solarToGrid: "zon → net",
  solarBatteryToCharger: "batterij (zon) → lader",
  gridBatteryToCharger: "batterij (net) → lader",
  solarBatteryToGrid: "batterij (zon) → net",
  gridBatteryToGrid: "batterij (net) → net",
  gridToCharger: "net → lader",
  gridToBattery: "net → batterij",
  totalSolarToCharger: "zon → lader (totaal)",
  totalGridToCharger: "net → lader (totaal)",
  solarBatterySoc: "SoC batterij (zon)",
  gridBatterySoc: "SoC batterij (net)",
} as const;

export type EnergyColumn = keyof typeof EXCEL_COLUMNS;

export type EnergyColumnIndexes = Record<EnergyColumn, number>;

export function getEnergyColumnIndexes(headers: readonly unknown[]): EnergyColumnIndexes {
  const headerIndexes = new Map<string, number>();

  headers.forEach((header, index) => {
    if (typeof header === "string") {
      headerIndexes.set(header.trim(), index);
    }
  });

  const missingHeaders: string[] = [];
  const indexes = {} as EnergyColumnIndexes;

  for (const [column, header] of Object.entries(EXCEL_COLUMNS) as [EnergyColumn, string][]) {
    const index = headerIndexes.get(header);

    if (index === undefined) {
      missingHeaders.push(header);
    } else {
      indexes[column] = index;
    }
  }

  if (missingHeaders.length > 0) {
    throw new Error(`Sheet1 is missing required headers: ${missingHeaders.join(", ")}`);
  }

  return indexes;
}
