import type { EnergyFlows, EnergyMeasurement } from "./types";

export const EXPENSIVE_MARKET_SHARE = 0.2;

export type SmartChargingRow = {
  measurement: Pick<EnergyMeasurement, "pricePerKwh">;
  flows: {
    grid: Pick<EnergyFlows["grid"], "toChargerKwh">;
  };
};

export interface SmartChargingKpi {
  peakPriceAvoidancePercentage: number;
  expensiveChargingPercentage: number;
  averageMarketPricePerKwh: number;
  averageChargingPricePerKwh: number;
  totalChargingEnergyKwh: number;
  energyDuringExpensivePeriodsKwh: number;
  hasValidData: boolean;
}

function isFiniteNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function getExpensiveIntervalIndexes(rows: readonly SmartChargingRow[]): ReadonlySet<number> {
  const rankedIntervals = rows
    .map((row, index) => ({ index, pricePerKwh: row.measurement.pricePerKwh }))
    .filter((interval): interval is { index: number; pricePerKwh: number } =>
      isFiniteNumber(interval.pricePerKwh),
    )
    .sort((left, right) => right.pricePerKwh - left.pricePerKwh || left.index - right.index);
  const expensiveIntervalCount = Math.ceil(rankedIntervals.length * EXPENSIVE_MARKET_SHARE);

  return new Set(
    rankedIntervals.slice(0, expensiveIntervalCount).map((interval) => interval.index),
  );
}

export function calculateSmartChargingKpi(rows: readonly SmartChargingRow[]): SmartChargingKpi {
  const marketPrices = rows.map((row) => row.measurement.pricePerKwh).filter(isFiniteNumber);
  const averageMarketPricePerKwh =
    marketPrices.length > 0
      ? marketPrices.reduce((total, price) => total + price, 0) / marketPrices.length
      : 0;
  const expensiveIntervalIndexes = getExpensiveIntervalIndexes(rows);

  let totalChargingEnergyKwh = 0;
  let weightedChargingCost = 0;
  let energyDuringExpensivePeriodsKwh = 0;

  rows.forEach((row, index) => {
    const pricePerKwh = row.measurement.pricePerKwh;
    const gridToChargerKwh = row.flows.grid.toChargerKwh;

    if (
      !isFiniteNumber(pricePerKwh) ||
      !Number.isFinite(gridToChargerKwh) ||
      gridToChargerKwh <= 0
    ) {
      return;
    }

    totalChargingEnergyKwh += gridToChargerKwh;
    weightedChargingCost += pricePerKwh * gridToChargerKwh;

    if (expensiveIntervalIndexes.has(index)) {
      energyDuringExpensivePeriodsKwh += gridToChargerKwh;
    }
  });

  const hasValidData = marketPrices.length > 0 && totalChargingEnergyKwh > 0;
  const averageChargingPricePerKwh = hasValidData
    ? weightedChargingCost / totalChargingEnergyKwh
    : 0;
  const expensiveChargingPercentage = hasValidData
    ? (energyDuringExpensivePeriodsKwh / totalChargingEnergyKwh) * 100
    : 0;

  return {
    peakPriceAvoidancePercentage: hasValidData ? 100 - expensiveChargingPercentage : 0,
    expensiveChargingPercentage,
    averageMarketPricePerKwh,
    averageChargingPricePerKwh,
    totalChargingEnergyKwh,
    energyDuringExpensivePeriodsKwh,
    hasValidData,
  };
}
