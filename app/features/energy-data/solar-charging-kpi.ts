import type { EnergyTotals } from "./types";

export const CHARGER_TOTAL_TOLERANCE_KWH = 0.01;

export interface SolarChargingKpi {
  solarPercentage: number;
  gridPercentage: number;
  totalChargingEnergyKwh: number;
  hasChargingEnergy: boolean;
  isDataConsistent: boolean;
  isInputValid: boolean;
}

function isValidEnergy(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function normalizeEnergy(value: number): number {
  return isValidEnergy(value) ? value : 0;
}

export function calculateSolarChargingKpi(
  totals: Pick<
    EnergyTotals,
    "chargerEnergyKwh" | "totalSolarToChargerKwh" | "totalGridToChargerKwh"
  >,
): SolarChargingKpi {
  const isInputValid = Object.values(totals).every(isValidEnergy);
  const totalSolarToChargerKwh = normalizeEnergy(totals.totalSolarToChargerKwh);
  const totalGridToChargerKwh = normalizeEnergy(totals.totalGridToChargerKwh);
  const chargerEnergyKwh = normalizeEnergy(totals.chargerEnergyKwh);
  const totalChargingEnergyKwh = totalSolarToChargerKwh + totalGridToChargerKwh;
  const hasChargingEnergy = totalChargingEnergyKwh > 0;
  const solarPercentage = hasChargingEnergy
    ? (totalSolarToChargerKwh / totalChargingEnergyKwh) * 100
    : 0;
  const difference = Math.abs(chargerEnergyKwh - totalChargingEnergyKwh);

  return {
    solarPercentage,
    gridPercentage: hasChargingEnergy ? 100 - solarPercentage : 0,
    totalChargingEnergyKwh,
    hasChargingEnergy,
    isDataConsistent: isInputValid && difference < CHARGER_TOTAL_TOLERANCE_KWH,
    isInputValid,
  };
}
