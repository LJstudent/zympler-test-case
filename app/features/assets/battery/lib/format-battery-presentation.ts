import { formatEnergy } from "~/features/energy-data";
import { formatAssetTooltipTimestamp } from "../../shared/lib/format-asset-chart";
import type {
  BatteryAggregation,
  BatteryAnalytics,
  BatteryPresentation,
  BatteryTimeView,
} from "../types/battery-types";

const MONEY_NUMBER_FORMATTER = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const AXIS_MONEY_FORMATTER = new Intl.NumberFormat("nl-NL", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatBatteryMoney(value: number | null): string {
  if (value === null) return "Niet beschikbaar";
  const sign = value < 0 ? "-" : "";
  return `${sign}€${MONEY_NUMBER_FORMATTER.format(Math.abs(value))}`;
}

export function formatBatteryAxisMoney(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}€${AXIS_MONEY_FORMATTER.format(Math.abs(value))}`;
}

export function formatBatteryAxisEnergy(value: number): string {
  const absolute = Math.abs(value);
  const scaled = absolute >= 1_000 ? absolute / 1_000 : absolute;
  const suffix = absolute >= 1_000 ? "k" : "";
  const sign = value < 0 ? "-" : "";
  return `${sign}${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(scaled)}${suffix}`;
}

export function formatBatteryLineMoney(value: number): string {
  return formatBatteryMoney(value);
}

function energy(value: number): string {
  return formatEnergy(Math.abs(value), "nl-NL");
}

function percentage(value: number, total: number): string {
  const result = total === 0 ? 0 : (value / total) * 100;
  return `${new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(result)}%`;
}

function tooltipTime(
  timestampMs: number,
  intervalEndMs: number,
  view: BatteryTimeView,
  aggregation: BatteryAggregation,
): string {
  const start = formatAssetTooltipTimestamp(new Date(timestampMs), view, aggregation);
  if (aggregation !== "raw") return start;
  const end = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(intervalEndMs));
  return `${start} – ${end}`;
}

export function createBatteryPresentation(
  analytics: BatteryAnalytics,
  view: BatteryTimeView,
  aggregation: BatteryAggregation,
  periodLabel: string,
  breakdown = false,
): BatteryPresentation {
  const totalProfitDisplay = formatBatteryMoney(analytics.totalProfitEur);
  const totalBatteryImportDisplay = energy(analytics.totalBatteryImportKwh);
  const totalBatteryExportDisplay = energy(analytics.totalBatteryExportKwh);
  const raw = aggregation === "raw";
  const baseSummary = raw
    ? breakdown
      ? `Raw battery flows for ${periodLabel}, split into grid and solar charging, and grid, charger and own-use discharge. Bars above zero represent battery charging and bars below zero represent battery discharging.`
      : `Raw battery energy flows for ${periodLabel}. Total battery import was ${totalBatteryImportDisplay} and total battery export was ${totalBatteryExportDisplay}. Bars above zero represent battery charging and bars below zero represent battery discharging.`
    : `Battery activity for ${periodLabel}. Total battery import was ${totalBatteryImportDisplay}, total battery export was ${totalBatteryExportDisplay} and total Profit was ${totalProfitDisplay}. Bars above zero represent battery charging, bars below zero represent battery discharging, and the dashed green line represents cumulative Profit.`;

  return {
    chartData: analytics.points.map((point) => ({
      ...point,
      tooltipTime: tooltipTime(point.timestampMs, point.intervalEndMs, view, aggregation),
      batteryImportDisplay: energy(point.batteryImport),
      batteryExportDisplay: energy(point.batteryExport),
      gridToBatteryDisplay: energy(point.gridToBattery),
      solarToBatteryDisplay: energy(point.solarToBattery),
      batteryToGridDisplay: energy(point.batteryToGrid),
      batteryToChargerDisplay: energy(point.batteryToCharger),
      batteryToOwnUseDisplay: energy(point.batteryToOwnUse),
      revenueDisplay: formatBatteryMoney(point.revenueEur),
      savingsDisplay: formatBatteryMoney(point.savingsEur),
      gridChargingCostsDisplay: formatBatteryMoney(point.gridChargingCostsEur),
      intervalProfitDisplay: formatBatteryMoney(point.intervalProfitEur),
      cumulativeProfitDisplay: formatBatteryMoney(point.cumulativeProfit),
    })),
    totalBatteryImportDisplay,
    totalGridToBatteryDisplay: energy(analytics.totalGridToBatteryKwh),
    totalSolarToBatteryDisplay: energy(analytics.totalSolarToBatteryKwh),
    totalBatteryExportDisplay,
    totalBatteryToGridDisplay: energy(analytics.totalBatteryToGridKwh),
    totalBatteryToChargerDisplay: energy(analytics.totalBatteryToChargerKwh),
    totalBatteryToOwnUseDisplay: energy(analytics.totalBatteryToOwnUseKwh),
    gridToBatteryPercentageDisplay: percentage(
      analytics.totalGridToBatteryKwh,
      analytics.totalBatteryImportKwh,
    ),
    solarToBatteryPercentageDisplay: percentage(
      analytics.totalSolarToBatteryKwh,
      analytics.totalBatteryImportKwh,
    ),
    batteryToGridPercentageDisplay: percentage(
      analytics.totalBatteryToGridKwh,
      analytics.totalBatteryExportKwh,
    ),
    batteryToChargerPercentageDisplay: percentage(
      analytics.totalBatteryToChargerKwh,
      analytics.totalBatteryExportKwh,
    ),
    batteryToOwnUsePercentageDisplay: percentage(
      analytics.totalBatteryToOwnUseKwh,
      analytics.totalBatteryExportKwh,
    ),
    totalRevenueDisplay: formatBatteryMoney(analytics.totalRevenueEur),
    totalSavingsDisplay: formatBatteryMoney(analytics.totalSavingsEur),
    totalGridChargingCostsDisplay: formatBatteryMoney(analytics.totalGridChargingCostsEur),
    totalProfitDisplay,
    screenReaderSummary:
      analytics.measurementCount === 0
        ? `No battery energy data is available for ${periodLabel}.`
        : baseSummary,
  };
}
