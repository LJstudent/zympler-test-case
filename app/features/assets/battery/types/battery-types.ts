import type {
  AssetAggregation,
  AssetChartDatum,
  AssetChartSeries,
  AssetTimeView,
} from "../../shared";

export type BatteryEnergySeriesKey =
  | "batteryImport"
  | "batteryExport"
  | "gridToBattery"
  | "solarToBattery"
  | "batteryToGrid"
  | "batteryToCharger"
  | "batteryToOwnUse";

export type BatterySeriesKey = BatteryEnergySeriesKey | "cumulativeProfit";
export type BatteryChartSeries = AssetChartSeries<BatterySeriesKey>;

export type BatteryInterval = {
  batteryImportKwh: number;
  batteryExportKwh: number;
  gridToBatteryKwh: number;
  solarToBatteryKwh: number;
  batteryToGridKwh: number;
  batteryToChargerKwh: number;
  batteryToOwnUseKwh: number;
  revenueEur: number | null;
  savingsEur: number | null;
  gridChargingCostsEur: number | null;
  intervalProfitEur: number | null;
};

export type BatteryAnalyticsPoint = AssetChartDatum & {
  batteryImport: number;
  batteryExport: number;
  gridToBattery: number;
  solarToBattery: number;
  batteryToGrid: number;
  batteryToCharger: number;
  batteryToOwnUse: number;
  revenueEur: number | null;
  savingsEur: number | null;
  gridChargingCostsEur: number | null;
  intervalProfitEur: number | null;
  cumulativeProfit: number | null;
};

export type BatteryAnalytics = {
  points: readonly BatteryAnalyticsPoint[];
  measurementCount: number;
  totalBatteryImportKwh: number;
  totalGridToBatteryKwh: number;
  totalSolarToBatteryKwh: number;
  totalBatteryExportKwh: number;
  totalBatteryToGridKwh: number;
  totalBatteryToChargerKwh: number;
  totalBatteryToOwnUseKwh: number;
  totalRevenueEur: number | null;
  totalSavingsEur: number | null;
  totalGridChargingCostsEur: number | null;
  totalProfitEur: number | null;
};

export type BatteryChartDatum = BatteryAnalyticsPoint & {
  tooltipTime: string;
  batteryImportDisplay: string;
  batteryExportDisplay: string;
  gridToBatteryDisplay: string;
  solarToBatteryDisplay: string;
  batteryToGridDisplay: string;
  batteryToChargerDisplay: string;
  batteryToOwnUseDisplay: string;
  revenueDisplay: string;
  savingsDisplay: string;
  gridChargingCostsDisplay: string;
  intervalProfitDisplay: string;
  cumulativeProfitDisplay: string;
};

export type BatteryPresentation = {
  chartData: readonly BatteryChartDatum[];
  totalBatteryImportDisplay: string;
  totalGridToBatteryDisplay: string;
  totalSolarToBatteryDisplay: string;
  totalBatteryExportDisplay: string;
  totalBatteryToGridDisplay: string;
  totalBatteryToChargerDisplay: string;
  totalBatteryToOwnUseDisplay: string;
  gridToBatteryPercentageDisplay: string;
  solarToBatteryPercentageDisplay: string;
  batteryToGridPercentageDisplay: string;
  batteryToChargerPercentageDisplay: string;
  batteryToOwnUsePercentageDisplay: string;
  totalRevenueDisplay: string;
  totalSavingsDisplay: string;
  totalGridChargingCostsDisplay: string;
  totalProfitDisplay: string;
  screenReaderSummary: string;
};

export type BatteryTimeView = AssetTimeView;
export type BatteryAggregation = AssetAggregation;
