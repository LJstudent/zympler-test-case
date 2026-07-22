export interface EnergyDataset {
  rows: EnergyDataRow[];
  totals: EnergyTotals;
}

export interface EnergyTotals {
  solarGenerationKwh: number;
  chargerEnergyKwh: number;
  totalSolarToChargerKwh: number;
  totalGridToChargerKwh: number;
}

export interface EnergyDataRow {
  start: Date;
  end: Date;
  measurement: EnergyMeasurement;
  flows: EnergyFlows;
}

export interface EnergyMeasurement {
  hbe: number;
  pricePerKwh: number | null;
  gridImportKwh: number | null;
  gridExportKwh: number | null;
  solarGenerationKwh: number;
  batteryChargeKwh: number;
  batteryDischargeKwh: number;
  chargerEnergyKwh: number;
  batterySoc: {
    solarOrigin: number | null;
    gridOrigin: number | null;
  };
}

export interface EnergyFlows {
  solar: {
    toBatteryKwh: number;
    toGridKwh: number;
    toChargerKwh: number;
  };
  grid: {
    toBatteryKwh: number;
    toChargerKwh: number;
  };
  battery: {
    solarOrigin: {
      toGridKwh: number;
      toChargerKwh: number;
    };
    gridOrigin: {
      toGridKwh: number;
      toChargerKwh: number;
    };
  };
  charger: {
    totalFromSolarKwh: number;
    totalFromGridKwh: number;
  };
}
